"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RealtimePostgresChangesPayload, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type ThreadStatus = "Pending Review" | "Quoted" | "Confirmed" | "Rejected";
type QuoteStatus = "Sent" | "Accepted" | "Declined" | "Superseded";

type ThreadRow = {
  id: string;
  status: ThreadStatus;
  accepted_quote_id: string | null;
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender_role: "customer" | "admin";
  body: string;
  created_at: string;
};

type QuoteRow = {
  id: string;
  thread_id: string;
  title: string;
  item_description: string;
  quantity: number;
  unit_price: number | string;
  quoted_total: number | string;
  delivery_date: string | null;
  notes: string | null;
  status: QuoteStatus;
  created_at: string;
};

export interface CustomOrderChatMessage {
  id: string;
  role: "user" | "store";
  text: string;
  time: string;
  createdAt: string;
}

export interface CustomOrderQuote {
  id: string;
  title: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  quotedTotal: number;
  deliveryDate: string | null;
  notes: string | null;
  status: QuoteStatus;
  createdAt: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapMessageRow(row: MessageRow): CustomOrderChatMessage {
  return {
    id: row.id,
    role: row.sender_role === "customer" ? "user" : "store",
    text: row.body,
    time: formatTime(row.created_at),
    createdAt: row.created_at,
  };
}

function mapQuoteRow(row: QuoteRow): CustomOrderQuote {
  return {
    id: row.id,
    title: row.title,
    itemDescription: row.item_description,
    quantity: Number(row.quantity ?? 0),
    unitPrice: Number(row.unit_price ?? 0),
    quotedTotal: Number(row.quoted_total ?? 0),
    deliveryDate: row.delivery_date,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function useCustomOrderChat(user: User | null) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threadStatus, setThreadStatus] = useState<ThreadStatus | null>(null);
  const [acceptedQuoteId, setAcceptedQuoteId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CustomOrderChatMessage[]>([]);
  const [quotes, setQuotes] = useState<CustomOrderQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThreadData = useCallback(async (targetThreadId: string) => {
    const supabase = createClient();

    const [messagesResult, quotesResult] = await Promise.all([
      supabase
        .from("custom_order_messages")
        .select("id, thread_id, sender_role, body, created_at")
        .eq("thread_id", targetThreadId)
        .order("created_at", { ascending: true }),
      supabase
        .from("custom_order_quotes")
        .select("id, thread_id, title, item_description, quantity, unit_price, quoted_total, delivery_date, notes, status, created_at")
        .eq("thread_id", targetThreadId)
        .order("created_at", { ascending: false }),
    ]);

    if (messagesResult.error) {
      setError(messagesResult.error.message);
      return;
    }

    if (quotesResult.error) {
      setError(quotesResult.error.message);
      return;
    }

    const mappedMessages = ((messagesResult.data ?? []) as MessageRow[]).map(mapMessageRow);
    const mappedQuotes = ((quotesResult.data ?? []) as QuoteRow[]).map(mapQuoteRow);

    setMessages(mappedMessages);
    setQuotes(mappedQuotes);
  }, []);

  const ensureThread = useCallback(async () => {
    if (!user?.id) {
      setThreadId(null);
      setThreadStatus(null);
      setAcceptedQuoteId(null);
      setMessages([]);
      setQuotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data: activeThread, error: activeThreadError } = await supabase
      .from("custom_order_threads")
      .select("id, status, accepted_quote_id")
      .eq("customer_user_id", user.id)
      .in("status", ["Pending Review", "Quoted"]) 
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeThreadError) {
      setError(activeThreadError.message);
      setLoading(false);
      return;
    }

    let resolvedThread = activeThread as ThreadRow | null;

    if (!resolvedThread) {
      const { data: latestThread, error: latestThreadError } = await supabase
        .from("custom_order_threads")
        .select("id, status, accepted_quote_id")
        .eq("customer_user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestThreadError) {
        setError(latestThreadError.message);
        setLoading(false);
        return;
      }

      resolvedThread = latestThread as ThreadRow | null;
    }

    if (!resolvedThread) {
      setThreadId(null);
      setThreadStatus(null);
      setAcceptedQuoteId(null);
      setMessages([]);
      setQuotes([]);
      setLoading(false);
      return;
    }

    setThreadId(resolvedThread.id);
    setThreadStatus(resolvedThread.status);
    setAcceptedQuoteId(resolvedThread.accepted_quote_id);

    await fetchThreadData(resolvedThread.id);
    setLoading(false);
  }, [fetchThreadData, user]);

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
      .channel(`custom-order-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "custom_order_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload: RealtimePostgresChangesPayload<MessageRow>) => {
          const row = payload.new as MessageRow;
          if (!row?.id) return;
          const mapped = mapMessageRow(row);
          setMessages((previous) => {
            if (previous.some((message) => message.id === mapped.id)) return previous;
            return [...previous, mapped].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "custom_order_quotes",
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          void fetchThreadData(threadId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "custom_order_threads",
          filter: `id=eq.${threadId}`,
        },
        (payload: RealtimePostgresChangesPayload<ThreadRow>) => {
          const row = payload.new as ThreadRow;
          setThreadStatus(row.status ?? null);
          setAcceptedQuoteId(row.accepted_quote_id ?? null);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchThreadData, threadId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!user?.id) return;

      const trimmed = text.trim();
      if (!trimmed) return;

      setSending(true);
      setError(null);

      const supabase = createClient();
      let activeThreadId = threadId;

      if (!activeThreadId || threadStatus === "Confirmed" || threadStatus === "Rejected") {
        const { data: insertedThread, error: insertedThreadError } = await supabase
          .from("custom_order_threads")
          .insert({
            customer_user_id: user.id,
            status: "Pending Review",
            subject: "Custom Order Request",
          })
          .select("id, status, accepted_quote_id")
          .single();

        if (insertedThreadError || !insertedThread) {
          setError(insertedThreadError?.message ?? "Failed to start custom order thread");
          setSending(false);
          return;
        }

        activeThreadId = insertedThread.id;
        setThreadId(insertedThread.id);
        setThreadStatus(insertedThread.status as ThreadStatus);
        setAcceptedQuoteId(insertedThread.accepted_quote_id ?? null);
        setMessages([]);
        setQuotes([]);
      }

      const { error: messageError } = await supabase.from("custom_order_messages").insert({
        thread_id: activeThreadId,
        sender_role: "customer",
        sender_user_id: user.id,
        body: trimmed,
      });

      if (messageError) {
        setError(messageError.message);
      }

      setSending(false);
    },
    [threadId, threadStatus, user]
  );

  const acceptQuote = useCallback(async (quoteId: string) => {
    if (!quoteId) return;

    setError(null);

    const response = await fetch(`/api/custom-orders/quotes/${quoteId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string; ok?: boolean };

    if (!response.ok) {
      setError(body.error ?? "Failed to accept quotation");
      throw new Error(body.error ?? "Failed to accept quotation");
    }

    await ensureThread();
  }, [ensureThread]);

  const activeQuote = useMemo(() => {
    if (acceptedQuoteId) {
      return quotes.find((quote) => quote.id === acceptedQuoteId) ?? null;
    }

    return quotes.find((quote) => quote.status === "Sent") ?? null;
  }, [acceptedQuoteId, quotes]);

  return useMemo(
    () => ({
      threadId,
      threadStatus,
      messages,
      quotes,
      activeQuote,
      loading,
      sending,
      error,
      sendMessage,
      acceptQuote,
      refetch: ensureThread,
    }),
    [
      threadId,
      threadStatus,
      messages,
      quotes,
      activeQuote,
      loading,
      sending,
      error,
      sendMessage,
      acceptQuote,
      ensureThread,
    ]
  );
}

