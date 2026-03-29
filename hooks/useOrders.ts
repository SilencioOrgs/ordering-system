"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type OrderItemRow = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  delivery_mode: string;
  delivery_address: string | null;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number | null;
  shipping_discount_amount: number | null;
  total: number | null;
  scheduled_date: string | null;
  applied_reward_title: string | null;
  points_earned: number | null;
  bonus_points_earned: number | null;
  rated: boolean | null;
  rating: number | null;
  rating_note: string | null;
  created_at: string;
  order_items: OrderItemRow[] | null;
};

export interface OrderWithItems {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  delivery_mode: string;
  delivery_address: string | null;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  shipping_discount_amount: number;
  total: number;
  scheduled_date: string | null;
  applied_reward_title: string | null;
  points_earned: number;
  bonus_points_earned: number;
  rated: boolean;
  rating: number | null;
  rating_note: string | null;
  created_at: string;
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

export function useOrders(user: User | null) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        status,
        payment_method,
        payment_status,
        delivery_mode,
        delivery_address,
        subtotal,
        delivery_fee,
        discount_amount,
        shipping_discount_amount,
        total,
        scheduled_date,
        applied_reward_title,
        points_earned,
        bonus_points_earned,
        rated,
        rating,
        rating_note,
        created_at,
        order_items(id, name, quantity, price)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }

    const mappedOrders = ((data ?? []) as unknown as OrderRow[]).map((order) => ({
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      delivery_mode: order.delivery_mode,
      delivery_address: order.delivery_address,
      subtotal: Number(order.subtotal ?? 0),
      delivery_fee: Number(order.delivery_fee ?? 0),
      discount_amount: Number(order.discount_amount ?? 0),
      shipping_discount_amount: Number(order.shipping_discount_amount ?? 0),
      total:
        order.total !== null && order.total !== undefined
          ? Number(order.total)
          : Number(order.subtotal ?? 0) + Number(order.delivery_fee ?? 0),
      scheduled_date: order.scheduled_date,
      applied_reward_title: order.applied_reward_title,
      points_earned: Number(order.points_earned ?? 0),
      bonus_points_earned: Number(order.bonus_points_earned ?? 0),
      rated: Boolean(order.rated),
      rating: order.rating === null ? null : Number(order.rating),
      rating_note: order.rating_note,
      created_at: order.created_at,
      items: (order.order_items ?? []).map((item) => ({
        id: item.id,
        product_name: item.name,
        quantity: Number(item.quantity ?? 0),
        unit_price: Number(item.price ?? 0),
      })),
    }));

    setOrders(mappedOrders);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`orders-realtime-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        () => void fetchOrders()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchOrders, user]);

  return { orders, loading, refetch: fetchOrders };
}
