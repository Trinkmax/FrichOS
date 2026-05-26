import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locationId = url.searchParams.get("location");
  if (!locationId) return NextResponse.json({}, { status: 400 });

  const supabase = await createClient();
  const [orders, tasks, andon, metrics] = await Promise.all([
    supabase
      .from("v_active_orders_kitchen")
      .select("*")
      .eq("location_id", locationId)
      .order("placed_at", { ascending: true }),
    supabase
      .from("order_station_tasks_view")
      .select("*")
      .eq("location_id", locationId)
      .in("status", ["queued", "in_progress"])
      .order("start_target_at", { ascending: true }),
    supabase
      .from("andon_pulls")
      .select("id, state, triggered_at, station_slug, note, category_id, andon_categories(name, color)")
      .eq("location_id", locationId)
      .not("state", "in", "(resolved,cancelled)")
      .order("triggered_at", { ascending: false }),
    supabase
      .from("v_station_live_metrics")
      .select("*")
      .eq("location_id", locationId),
  ]);

  return NextResponse.json({
    orders: orders.data ?? [],
    tasks: tasks.data ?? [],
    andon: andon.data ?? [],
    metrics: metrics.data ?? [],
  });
}
