import { NextRequest, NextResponse } from "next/server";

import { getRewardSummary, markNotificationRead } from "@/lib/rewards/service";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceSupabase = createServiceClient();
  const summary = await getRewardSummary(serviceSupabase, user.id);

  return NextResponse.json({ notifications: summary.notifications });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { notificationId?: string | null; markAll?: boolean };
  try {
    body = (await req.json()) as { notificationId?: string | null; markAll?: boolean };
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const serviceSupabase = createServiceClient();
  await markNotificationRead(serviceSupabase, user.id, body.notificationId ?? null, Boolean(body.markAll));

  return NextResponse.json({ success: true });
}
