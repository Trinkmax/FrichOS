import { createClient } from "@/lib/supabase/server";
import { Dispatcher } from "@/components/manager/Dispatcher";

export const dynamic = "force-dynamic";

export default async function DispatcherPage({
  params,
}: {
  params: Promise<{ chainSlug: string }>;
}) {
  const { chainSlug } = await params;
  const supabase = await createClient();

  const [locations, products, recent] = await Promise.all([
    supabase
      .from("locations")
      .select("id, slug, name, short_name, has_dining_area")
      .order("name"),
    supabase
      .from("products")
      .select("id, slug, name, price_cents, category_id, is_veggie")
      .eq("active", true)
      .order("name"),
    supabase
      .from("orders")
      .select(
        "id, order_code, channel, customer_name, is_vip, complexity_score, status, placed_at, total_cents, location_id",
      )
      .order("placed_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <Dispatcher
      chainSlug={chainSlug}
      locations={(locations.data ?? []).map((l) => ({
        id: l.id,
        slug: l.slug,
        name: l.name,
        shortName: l.short_name ?? l.name,
        hasDiningArea: l.has_dining_area,
      }))}
      products={(products.data ?? []).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        priceCents: p.price_cents,
        isVeggie: p.is_veggie,
      }))}
      recent={(recent.data ?? []) as never}
    />
  );
}
