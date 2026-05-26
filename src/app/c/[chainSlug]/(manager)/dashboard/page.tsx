import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocationDashboard } from "@/components/manager/LocationDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ chainSlug: string }>;
  searchParams: Promise<{ loc?: string }>;
}) {
  const { chainSlug } = await params;
  const { loc } = await searchParams;
  const supabase = await createClient();

  const { data: chain } = await supabase
    .from("chains")
    .select("id")
    .eq("slug", chainSlug)
    .maybeSingle();
  if (!chain) redirect("/");

  const { data: locations } = await supabase
    .from("locations")
    .select("id, slug, name, short_name, has_dining_area, current_mode")
    .order("name");

  const activeLocation =
    (locations ?? []).find((l) => l.slug === loc) ?? (locations ?? [])[0];
  if (!activeLocation) {
    return <div className="text-muted-foreground">No hay locales sembrados.</div>;
  }

  const [orders, tasks, andon, metrics] = await Promise.all([
    supabase
      .from("v_active_orders_kitchen")
      .select("*")
      .eq("location_id", activeLocation.id)
      .order("placed_at", { ascending: true }),
    supabase
      .from("order_station_tasks_view")
      .select("*")
      .eq("location_id", activeLocation.id)
      .in("status", ["queued", "in_progress"])
      .order("start_target_at", { ascending: true }),
    supabase
      .from("andon_pulls")
      .select("id, state, triggered_at, station_slug, note, category_id, andon_categories(name, color)")
      .eq("location_id", activeLocation.id)
      .not("state", "in", "(resolved,cancelled)")
      .order("triggered_at", { ascending: false }),
    supabase
      .from("v_station_live_metrics")
      .select("*")
      .eq("location_id", activeLocation.id),
  ]);

  return (
    <LocationDashboard
      chainSlug={chainSlug}
      locations={(locations ?? []).map((l) => ({
        id: l.id,
        slug: l.slug,
        name: l.name,
        shortName: l.short_name ?? l.name,
        hasDiningArea: l.has_dining_area,
      }))}
      activeLocation={{
        id: activeLocation.id,
        slug: activeLocation.slug,
        name: activeLocation.name,
        shortName: activeLocation.short_name ?? activeLocation.name,
        hasDiningArea: activeLocation.has_dining_area,
        currentMode: activeLocation.current_mode,
      }}
      orders={(orders.data ?? []) as never}
      tasks={(tasks.data ?? []) as never}
      andon={(andon.data ?? []) as never}
      metrics={(metrics.data ?? []) as never}
    />
  );
}
