import { createClient } from "@/lib/supabase/server";
import { requireChainConfig } from "@/lib/chain/config";
import { FinancialDashboard } from "@/components/manager/FinancialDashboard";

export const dynamic = "force-dynamic";

export default async function FinancialPage({ params }: { params: Promise<{ chainSlug: string }> }) {
  const { chainSlug } = await params;
  const config = await requireChainConfig(chainSlug);
  const supabase = await createClient();
  const [orders, products, throughput] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_code, channel, total_cents, complexity_score, placed_at, location_id, locations(short_name)")
      .eq("chain_id", config.id)
      .order("placed_at", { ascending: false })
      .limit(40),
    supabase
      .from("products")
      .select("id, slug, name, price_cents, cost_cents, complexity_factor")
      .eq("chain_id", config.id)
      .eq("active", true),
    supabase
      .from("v_throughput_hourly")
      .select("*")
      .eq("chain_id", config.id)
      .order("hour", { ascending: false })
      .limit(24),
  ]);
  return (
    <FinancialDashboard
      chainSlug={chainSlug}
      commissionPct={config.channelCommissionPct}
      foodCostPct={config.foodCostDefaultPct}
      orders={(orders.data ?? []) as never}
      products={(products.data ?? []) as never}
      throughput={(throughput.data ?? []) as never}
    />
  );
}
