import { createClient } from "@/lib/supabase/server";
import { QualityHoldsPanel } from "@/components/manager/QualityHoldsPanel";

export const dynamic = "force-dynamic";

export default async function HoldsPage({ params }: { params: Promise<{ chainSlug: string }> }) {
  const { chainSlug } = await params;
  const supabase = await createClient();
  const [categories, batches, locations] = await Promise.all([
    supabase.from("hold_categories").select("*").eq("active", true),
    supabase
      .from("quality_hold_batches")
      .select("*, locations(short_name)")
      .order("prepared_at", { ascending: false })
      .limit(50),
    supabase.from("locations").select("id, slug, short_name, name").order("name"),
  ]);
  return (
    <QualityHoldsPanel
      chainSlug={chainSlug}
      categories={(categories.data ?? []) as never}
      batches={(batches.data ?? []) as never}
      locations={(locations.data ?? []).map((l) => ({ id: l.id, slug: l.slug, name: l.name, shortName: l.short_name ?? l.name }))}
    />
  );
}
