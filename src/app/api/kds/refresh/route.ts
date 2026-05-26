import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locationId = url.searchParams.get("location");
  const stationSlug = url.searchParams.get("station");
  if (!locationId || !stationSlug) {
    return NextResponse.json({ tasks: [] }, { status: 400 });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("order_station_tasks_view" as never)
    .select("*")
    .eq("station_slug", stationSlug)
    .eq("location_id", locationId)
    .in("status", ["queued", "in_progress"])
    .order("start_target_at", { ascending: true })
    .limit(40);

  return NextResponse.json({ tasks: data ?? [] });
}
