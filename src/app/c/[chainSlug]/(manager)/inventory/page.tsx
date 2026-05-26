import { createClient } from "@/lib/supabase/server";
import { InventoryPanel } from "@/components/manager/InventoryPanel";

export const dynamic = "force-dynamic";

export default async function InventoryPage({ params }: { params: Promise<{ chainSlug: string }> }) {
  const { chainSlug } = await params;
  const supabase = await createClient();
  const [items, temps] = await Promise.all([
    supabase.from("inventory_items").select("*").eq("active", true).order("name"),
    supabase
      .from("temperature_readings")
      .select("*, locations(short_name)")
      .order("recorded_at", { ascending: false })
      .limit(50),
  ]);
  return <InventoryPanel chainSlug={chainSlug} items={(items.data ?? []) as never} temps={(temps.data ?? []) as never} />;
}
