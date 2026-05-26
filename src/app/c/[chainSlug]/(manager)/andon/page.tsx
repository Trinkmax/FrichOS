import { createClient } from "@/lib/supabase/server";
import { AndonPanel } from "@/components/manager/AndonPanel";

export const dynamic = "force-dynamic";

export default async function AndonPage({ params }: { params: Promise<{ chainSlug: string }> }) {
  const { chainSlug } = await params;
  const supabase = await createClient();
  const [categories, open, recent, pareto] = await Promise.all([
    supabase.from("andon_categories").select("*").eq("active", true).order("display_order"),
    supabase
      .from("andon_pulls")
      .select("id, state, triggered_at, station_slug, note, location_id, andon_categories(name, color, slug), locations(short_name)")
      .not("state", "in", "(resolved,cancelled)")
      .order("triggered_at", { ascending: false }),
    supabase
      .from("andon_pulls")
      .select("id, state, triggered_at, station_slug, root_cause, resolved_at, andon_categories(name, color), locations(short_name)")
      .order("triggered_at", { ascending: false })
      .limit(30),
    supabase.from("v_andon_pareto").select("*").order("pulls_30d", { ascending: false }).limit(10),
  ]);
  return (
    <AndonPanel
      chainSlug={chainSlug}
      categories={(categories.data ?? []) as never}
      open={(open.data ?? []) as never}
      recent={(recent.data ?? []) as never}
      pareto={(pareto.data ?? []) as never}
    />
  );
}
