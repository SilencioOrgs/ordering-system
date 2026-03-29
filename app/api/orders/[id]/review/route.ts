import { NextRequest, NextResponse } from "next/server";

import { awardReviewPoints, createUserNotification, loadStoreAndRewardSettings } from "@/lib/rewards/service";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { rating?: number; note?: string | null };
  try {
    body = (await req.json()) as { rating?: number; note?: string | null };
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const serviceSupabase = createServiceClient();
  const { data: order } = await serviceSupabase
    .from("orders")
    .select("id, user_id, order_number, status, rated")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status !== "Delivered") {
    return NextResponse.json({ error: "You can only review delivered orders." }, { status: 400 });
  }

  if (order.rated) {
    return NextResponse.json({ error: "This order has already been reviewed." }, { status: 409 });
  }

  await serviceSupabase
    .from("orders")
    .update({
      rated: true,
      rating,
      rating_note: body.note?.trim() || null,
      rated_at: new Date().toISOString(),
    })
    .eq("id", id);

  const { rewardSettings } = await loadStoreAndRewardSettings(serviceSupabase);
  await awardReviewPoints(serviceSupabase, user.id, id, order.order_number, rewardSettings);
  await createUserNotification(
    serviceSupabase,
    user.id,
    "Review submitted",
    `Thanks for rating order ${order.order_number}.`,
    "general",
    { orderId: id }
  );

  return NextResponse.json({ success: true });
}
