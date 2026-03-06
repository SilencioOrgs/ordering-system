"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RealtimePostgresInsertPayload, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type ChatThreadRow = {
  id: string;
};

type ChatMessageRow = {
  id: string;
  thread_id: string;
  sender_role: "customer" | "admin";
  body: string;
  created_at: string;
};

export interface SupportChatMessage {
  id: string;
  role: "user" | "store";
  text: string;
  time: string;
  createdAt: string;
}

function formatMessageTime(isoDate: string) {
  return new Date(isoDate).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapRowToMessage(row: ChatMessageRow): SupportChatMessage {
  return {
    id: row.id,
    role: row.sender_role === "customer" ? "user" : "store",
    text: row.body,
    time: formatMessageTime(row.created_at),
    createdAt: row.created_at,
  };
}

export function useSupportChat(user: User | null) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (activeThreadId: string) => {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("chat_messages")
      .select("id, thread_id, sender_role, body, created_at")
      .eq("thread_id", activeThreadId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    const mapped = ((data ?? []) as ChatMessageRow[]).map(mapRowToMessage);
    setMessages(mapped);
  }, []);

  const ensureThread = useCallback(async () => {
    if (!user?.id) {
      setThreadId(null);
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: existingThread, error: threadError } = await supabase
      .from("chat_threads")
      .select("id")
      .eq("customer_user_id", user.id)
      .is("order_id", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (threadError) {
      setError(threadError.message);
      setLoading(false);
      return;
    }

    let activeThreadId = (existingThread as ChatThreadRow | null)?.id ?? null;

    if (!activeThreadId) {
      const { data: insertedThread, error: insertError } = await supabase
        .from("chat_threads")
        .insert({
          customer_user_id: user.id,
          subject: "Support Chat",
          status: "open",
        })
        .select("id")
        .single();

      if (insertError || !insertedThread) {
        setError(insertError?.message ?? "Failed to create chat thread");
        setLoading(false);
        return;
      }

      activeThreadId = (insertedThread as ChatThreadRow).id;
    }

    setThreadId(activeThreadId);
    await fetchMessages(activeThreadId);
    setLoading(false);
  }, [fetchMessages, user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void ensureThread();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [ensureThread]);

  useEffect(() => {
    if (!threadId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`support-chat-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload: RealtimePostgresInsertPayload<ChatMessageRow>) => {
          const newMessage = mapRowToMessage(payload.new);
          setMessages((previous) => {
            if (previous.some((message) => message.id === newMessage.id)) {
              return previous;
            }
            return [...previous, newMessage].sort(
              (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
            );
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [threadId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!threadId || !user?.id) return;

      const trimmed = text.trim();
      if (!trimmed) return;

      setSending(true);
      setError(null);

      const supabase = createClient();
      const { error: insertError } = await supabase.from("chat_messages").insert({
        thread_id: threadId,
        sender_role: "customer",
        sender_user_id: user.id,
        body: trimmed,
      });

      if (insertError) {
        setError(insertError.message);
      }

      setSending(false);
    },
    [threadId, user]
  );

  return useMemo(
    () => ({
      threadId,
      messages,
      loading,
      sending,
      error,
      sendMessage,
      refetch: ensureThread,
    }),
    [threadId, messages, loading, sending, error, sendMessage, ensureThread]
  );
}
