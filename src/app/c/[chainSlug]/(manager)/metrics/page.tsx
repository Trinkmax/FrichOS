import { createClient } from "@/lib/supabase/server";
import { MetricsDashboard } from "@/components/manager/MetricsDashboard";

export const dynamic = "force-dynamic";

export default async function MetricsPage({ params }: { params: Promise<{ chainSlug: string }> }) {
  const { chainSlug } = await params;
  const supabase = await createClient();
  const [station, throughput, locations, products] = await Promise.all([
    supabase.from("v_station_stats_daily").select("*").order("day", { ascending: false }).limit(60),
    supabase.from("v_throughput_hourly").select("*").order("hour", { ascending: false }).limit(48),
    supabase.from("locations").select("id, slug, short_name, name").order("name"),
    supabase.from("product_station_steps").select("station_slug, target_seconds, sigma_seconds, confidence_level"),
  ]);
  return (
    <MetricsDashboard
      chainSlug={chainSlug}
      stationStats={(station.data ?? []) as never}
      throughput={(throughput.data ?? []) as never}
      locations={(locations.data ?? []).map((l) => ({ id: l.id, slug: l.slug, name: l.name, shortName: l.short_name ?? l.name }))}
      baselineSteps={(products.data ?? []) as never}
    />
  );
}
