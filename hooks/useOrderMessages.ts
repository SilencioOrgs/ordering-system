"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

export interface OrderMessage {
  id: string;
  title: string;
  order_id: string | null;
  sender: "admin" | "system";
  message_type: "receipt" | "rating_prompt" | "reward" | "general";
  body: string;
  read: boolean;
  created_at: string;
  metadata: Record<string, unknown>;
}

type NotificationApiRow = {
  id: string;
  title: string;
  body: string;
  category: "order" | "reward" | "rating_prompt" | "general";
  readAt: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
};

function mapNotification(row: NotificationApiRow): OrderMessage {
  const loweredTitle = row.title.toLowerCase();
  const loweredBody = row.body.toLowerCase();
  const inferredMessageType =
    row.category === "reward"
      ? "reward"
      : row.category === "rating_prompt"
        ? "rating_prompt"
        : row.category === "order" && (loweredTitle.includes("delivered") || loweredBody.includes("delivered"))
          ? "receipt"
          : "general";

  return {
    id: row.id,
    title: row.title,
    order_id: typeof row.metadata.orderId === "string" ? row.metadata.orderId : null,
    sender: row.category === "general" ? "admin" : "system",
    message_type: inferredMessageType,
    body: row.body,
    read: Boolean(row.readAt),
    created_at: row.createdAt,
    metadata: row.metadata ?? {},
  };
}

export function useOrderMessages(user: User | null) {
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const response = await fetch("/api/notifications", {
      cache: "no-store",
    });

    const body = (await response.json()) as { notifications?: NotificationApiRow[] };
    if (!response.ok) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setMessages((body.notifications ?? []).map(mapNotification));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchMessages();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchMessages]);

  useEffect(() => {
    if (!user) return;

    const intervalId = window.setInterval(() => {
      void fetchMessages();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchMessages, user]);

  const markRead = useCallback(
    async (messageId: string) => {
      if (!messageId) return;

      setMessages((prev) => prev.map((message) => (message.id === messageId ? { ...message, read: true } : message)));

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: messageId }),
      });
    },
    []
  );

  const markAllRead = useCallback(async () => {
    setMessages((prev) => prev.map((message) => ({ ...message, read: true })));

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
  }, []);

  const unreadCount = useMemo(() => messages.filter((message) => !message.read).length, [messages]);

  return useMemo(
    () => ({
      messages,
      unreadCount,
      loading,
      markRead,
      markAllRead,
      refetch: fetchMessages,
    }),
    [fetchMessages, loading, markAllRead, markRead, messages, unreadCount]
  );
}
