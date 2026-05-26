import { redirect } from "next/navigation";
import { Suspense } from "react";
import { KdsStationView } from "@/components/kds/KdsStationView";
import { createClient } from "@/lib/supabase/server";
import { getPinSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function KdsStationPage({
  params,
}: {
  params: Promise<{ chainSlug: string; stationSlug: string }>;
}) {
  const { chainSlug, stationSlug } = await params;

  const session = await getPinSession();
  if (!session) {
    redirect(`/c/${chainSlug}/pin?station=${stationSlug}`);
  }

  const supabase = await createClient();

  // Initial render from DB; client subscribes via Realtime after mount.
  const { data: tasks } = await supabase
    .from("order_station_tasks_view" as never)
    .select("*")
    .eq("station_slug", stationSlug)
    .eq("location_id", session.locationId)
    .in("status", ["queued", "in_progress"])
    .order("start_target_at", { ascending: true })
    .limit(40);

  return (
    <main
      data-surface="kds"
      data-kiosk="true"
      className="min-h-screen text-foreground"
    >
      <Suspense fallback={null}>
        <KdsStationView
          chainSlug={chainSlug}
          stationSlug={stationSlug}
          locationId={session.locationId}
          employeeId={session.employeeId}
          employeeName={session.employeeName}
          initialTasks={(tasks ?? []) as never}
        />
      </Suspense>
    </main>
  );
}
