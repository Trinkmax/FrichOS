import { createClient } from "@/lib/supabase/server";
import { DispatchPanel } from "@/components/manager/DispatchPanel";

export const dynamic = "force-dynamic";

export default async function DispatchPage({ params }: { params: Promise<{ chainSlug: string }> }) {
  const { chainSlug } = await params;
  const supabase = await createClient();
  const [ready, dispatched, events] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_code, channel, customer_name, total_cents, driver_eta_seconds, ready_at, location_id, locations(short_name)")
      .eq("status", "ready")
      .order("ready_at", { ascending: true }),
    supabase
      .from("orders")
      .select("id, order_code, channel, customer_name, total_cents, dispatched_at, location_id, locations(short_name)")
      .eq("status", "dispatched")
      .order("dispatched_at", { ascending: false })
      .limit(15),
    supabase
      .from("dispatch_events")
      .select("*, locations(short_name)")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  return (
    <DispatchPanel
      chainSlug={chainSlug}
      ready={(ready.data ?? []) as never}
      dispatched={(dispatched.data ?? []) as never}
      events={(events.data ?? []) as never}
    />
  );
}
