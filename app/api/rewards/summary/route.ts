import { NextResponse } from "next/server";

import { getRewardSummary } from "@/lib/rewards/service";
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

  return NextResponse.json({ summary });
}
