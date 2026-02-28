"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface OrderMessage {
  id: string;
  order_id: string;
  sender: "admin" | "user";
  message_type: "receipt" | "rating_prompt" | "general";
  body: string;
  read: boolean;
  created_at: string;
}

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number | string | null;
  created_at: string;
  updated_at: string;
};

const READ_STORAGE_KEY = "order_message_read_ids";

function getReadIdsFromStorage() {
  if (typeof window === "undefined") return new Set<string>();
  const raw = window.localStorage.getItem(READ_STORAGE_KEY);
  if (!raw) return new Set<string>();
  try {
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

function setReadIdsToStorage(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

function paymentStatusLabel(status: string) {
  if (status === "Verified") return "Paid";
  return status;
}

export function useOrderMessages(user: User | null) {
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(() => getReadIdsFromStorage());

  const mapOrdersToMessages = useCallback((orders: OrderRow[], readSet: Set<string>) => {
    const mapped = orders.map((order) => {
      const total = Number(order.total ?? 0).toFixed(2);
      const paymentLabel = paymentStatusLabel(order.payment_status);

      let body = `Order #${order.order_number} is now ${order.status}.`;
      if (order.payment_method === "COD") {
        body += ` Amount to pay in cash: PHP ${total}.`;
      } else {
        body += ` ${order.payment_method} payment is ${paymentLabel} (mock). Total: PHP ${total}.`;
      }

      const messageId = `order-${order.id}-${order.status}-${order.payment_status}`;

      return {
        id: messageId,
        order_id: order.id,
        sender: "admin" as const,
        message_type: order.status === "Delivered" ? "receipt" as const : "general" as const,
        body,
        read: readSet.has(messageId),
        created_at: order.updated_at ?? order.created_at,
      };
    });

    return mapped.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, status, payment_method, payment_status, total, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const mapped = mapOrdersToMessages((data ?? []) as OrderRow[], readIds);
    setMessages(mapped);
    setLoading(false);
  }, [mapOrdersToMessages, readIds, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`order-status-messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        () => void fetchMessages()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchMessages, user]);

  const markRead = useCallback(
    async (messageId: string) => {
      if (!messageId) return;
      setReadIds((prev) => {
        const next = new Set(prev);
        next.add(messageId);
        setReadIdsToStorage(next);
        return next;
      });
      setMessages((prev) => prev.map((message) => (message.id === messageId ? { ...message, read: true } : message)));
    },
    []
  );

  const markAllRead = useCallback(async () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const message of messages) {
        next.add(message.id);
      }
      setReadIdsToStorage(next);
      return next;
    });
    setMessages((prev) => prev.map((message) => ({ ...message, read: true })));
  }, [messages]);

  const unreadCount = useMemo(
    () => messages.filter((message) => !message.read).length,
    [messages]
  );

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
