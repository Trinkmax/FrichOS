/**
 * Server-side aggregator for the NOC virtual.
 * Una sola función que arma el `NocPayload` completo a partir de `chainSlug`.
 *
 * Aprovecha las views existentes (`v_active_orders_kitchen`, `v_station_live_metrics`,
 * `v_throughput_hourly`, `v_nps_by_location`) + una query directa para el heartbeat.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { generateInsight } from "@/lib/kpis/insight";
import type { LocationSignal } from "@/lib/kpis/network-health";
import type { KitchenMode, StationSlug } from "@/lib/types/db-enums";
import type { NocPayload } from "@/components/owner/noc/NocVirtualV2";
import type { NocLocationSummary } from "@/components/owner/noc/LocationCard";
import type { CompareSeries } from "@/components/owner/noc/ComparativeBento";

const HEARTBEAT_MINUTES = 60;
const PULSE_MINUTES = 30;

type AnyClient = SupabaseClient<any, any, any>;

type LocationRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  has_dining_area: boolean;
  current_mode: KitchenMode;
  lat: number | null;
  lng: number | null;
  settings: Record<string, unknown> | null;
};

export async function buildNocPayload(supabase: AnyClient, chainSlug: string): Promise<NocPayload | null> {
  const { data: chain } = await supabase
    .from("chains")
    .select("id, name")
    .eq("slug", chainSlug)
    .maybeSingle();
  if (!chain) return null;

  const chainId = chain.id as string;
  const chainName = (chain.name as string) ?? "—";

  const { data: locRows } = await supabase
    .from("locations")
    .select("id, slug, name, short_name, has_dining_area, current_mode, lat, lng, settings")
    .eq("chain_id", chainId)
    .order("name");

  const locations = (locRows ?? []) as LocationRow[];
  if (locations.length === 0) {
    return {
      chainName,
      serverNow: new Date().toISOString(),
      heartbeat: [],
      insight: { tone: "neutral", headline: "Sin locales activos en esta red." },
      locations: [],
      signals: [],
      comparatives: { revenue: [], throughput: [], nps: [], slaHit: [] },
    };
  }

  const locationIds = locations.map((l) => l.id);

  const now = new Date();
  const todayStart = startOfArgentinaDay(now);
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const minutesSinceMidnight = (now.getTime() - todayStart.getTime()) / 60_000;
  const yesterdayCutoff = new Date(yesterdayStart.getTime() + minutesSinceMidnight * 60_000);
  const heartbeatFrom = new Date(now.getTime() - HEARTBEAT_MINUTES * 60_000);
  const pulseFrom = new Date(now.getTime() - PULSE_MINUTES * 60_000);

  const npsFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    { data: activeOrdersRaw },
    { data: andonRaw },
    { data: stationMetricsRaw },
    { data: feedbackRaw },
    { data: pulseOrdersRaw },
    { data: heartbeatOrdersRaw },
    { data: todayOrdersRaw },
    { data: yesterdayOrdersRaw },
  ] = await Promise.all([
    supabase
      .from("v_active_orders_kitchen")
      .select("id, location_id, sla_remaining_sec, is_vip, channel")
      .in("location_id", locationIds),
    supabase
      .from("andon_pulls")
      .select("id, location_id, state, triggered_at, andon_categories(color)")
      .in("location_id", locationIds)
      .not("state", "in", "(resolved,cancelled)"),
    supabase
      .from("v_station_live_metrics")
      .select("location_id, station_slug, queue_depth, eta_to_idle_sec, utilization")
      .in("location_id", locationIds),
    supabase
      .from("feedback_responses")
      .select("location_id, star_rating, created_at")
      .in("location_id", locationIds)
      .gte("created_at", npsFrom.toISOString()),
    supabase
      .from("orders")
      .select("id, location_id, placed_at")
      .in("location_id", locationIds)
      .gte("placed_at", pulseFrom.toISOString()),
    supabase
      .from("orders")
      .select("id, placed_at")
      .in("location_id", locationIds)
      .gte("placed_at", heartbeatFrom.toISOString()),
    supabase
      .from("orders")
      .select("id, location_id, total_cents, placed_at, dispatched_at, delivered_at, sla_target_at, status")
      .in("location_id", locationIds)
      .gte("placed_at", todayStart.toISOString()),
    supabase
      .from("orders")
      .select("id, location_id, total_cents, placed_at")
      .in("location_id", locationIds)
      .gte("placed_at", yesterdayStart.toISOString())
      .lt("placed_at", yesterdayCutoff.toISOString()),
  ]);

  const activeOrders = (activeOrdersRaw ?? []) as Array<{
    id: string;
    location_id: string;
    sla_remaining_sec: number;
    is_vip: boolean;
    channel: string;
  }>;
  const andon = (andonRaw ?? []) as Array<{
    id: string;
    location_id: string;
    state: string;
    triggered_at: string;
    andon_categories: { color?: string | null } | Array<{ color?: string | null }> | null;
  }>;
  const stationMetrics = (stationMetricsRaw ?? []) as Array<{
    location_id: string;
    station_slug: StationSlug;
    queue_depth: number;
    eta_to_idle_sec: number;
    utilization: number;
  }>;
  const feedback = (feedbackRaw ?? []) as Array<{
    location_id: string;
    star_rating: number | null;
    created_at: string;
  }>;
  const pulseOrders = (pulseOrdersRaw ?? []) as Array<{ id: string; location_id: string; placed_at: string }>;
  const heartbeatOrders = (heartbeatOrdersRaw ?? []) as Array<{ id: string; placed_at: string }>;
  const todayOrders = (todayOrdersRaw ?? []) as Array<{
    id: string;
    location_id: string;
    total_cents: number | null;
    placed_at: string;
    dispatched_at: string | null;
    delivered_at: string | null;
    sla_target_at: string | null;
    status: string;
  }>;
  const yesterdayOrders = (yesterdayOrdersRaw ?? []) as Array<{
    id: string;
    location_id: string;
    total_cents: number | null;
    placed_at: string;
  }>;

  // ───── Heartbeat (red completa) ─────
  const heartbeat = bucketByMinute(
    heartbeatOrders.map((o) => o.placed_at),
    heartbeatFrom,
    HEARTBEAT_MINUTES,
  );

  // ───── Por location: signals + summary ─────
  const locationNames: Record<string, string> = {};
  const signals: LocationSignal[] = [];
  const summaries: Array<NocLocationSummary & { lat: number | null; lng: number | null }> = [];

  for (const loc of locations) {
    locationNames[loc.id] = loc.short_name ?? loc.name;
    const shortName = loc.short_name ?? loc.name;
    const settings = (loc.settings ?? {}) as { manager_name?: string; manager_whatsapp?: string };

    const locActive = activeOrders.filter((o) => o.location_id === loc.id);
    const locAndon = andon.filter((a) => a.location_id === loc.id);
    const locMetrics = stationMetrics.filter((m) => m.location_id === loc.id);
    const locTodayOrders = todayOrders.filter((o) => o.location_id === loc.id);
    const locYesterdayOrders = yesterdayOrders.filter((o) => o.location_id === loc.id);
    const locPulse = pulseOrders.filter((o) => o.location_id === loc.id);
    const locFeedback = feedback.filter((f) => f.location_id === loc.id);

    const slaRed = locActive.filter((o) => (o.sla_remaining_sec ?? 0) < 0).length;
    const slaAmber = locActive.filter((o) => {
      const rem = o.sla_remaining_sec ?? 0;
      return rem >= 0 && rem < 120;
    }).length;
    const vipCount = locActive.filter((o) => o.is_vip).length;

    const andonRed = locAndon.filter((a) => {
      const cat = Array.isArray(a.andon_categories) ? a.andon_categories[0] : a.andon_categories;
      return cat?.color === "red";
    }).length;

    const oldestAndonAgeSec =
      locAndon.length > 0
        ? Math.max(
            ...locAndon.map((a) => Math.max(0, (now.getTime() - new Date(a.triggered_at).getTime()) / 1000)),
          )
        : 0;

    const revenueToday = locTodayOrders.reduce((acc, o) => acc + (o.total_cents ?? 0), 0);
    const revenueYesterday = locYesterdayOrders.reduce((acc, o) => acc + (o.total_cents ?? 0), 0);
    const throughputToday = locTodayOrders.length;
    const throughputYesterday = locYesterdayOrders.length;

    const npsRolling = computeNpsFromFeedback(locFeedback);

    const topStation =
      locMetrics
        .slice()
        .sort((a, b) => b.utilization - a.utilization)[0] ?? null;

    const pulseSeries = bucketByMinute(
      locPulse.map((o) => o.placed_at),
      pulseFrom,
      PULSE_MINUTES,
    ).map((b) => b.count);

    signals.push({
      locationId: loc.id,
      ordersInKitchen: locActive.length,
      slaRed,
      slaAmber,
      vipCount,
      andonOpen: locAndon.length,
      andonRed,
      oldestAndonAgeSec,
      currentMode: loc.current_mode,
      metrics: locMetrics.map((m) => ({
        station: m.station_slug,
        queueDepth: m.queue_depth,
        utilization: Number(m.utilization),
        etaToIdleSeconds: m.eta_to_idle_sec,
      })),
      revenueTodayCents: revenueToday,
      revenueYesterdayCents: revenueYesterday,
      throughputTodayCount: throughputToday,
      throughputYesterdayCount: throughputYesterday,
      npsRolling7d: npsRolling,
    });

    summaries.push({
      id: loc.id,
      slug: loc.slug,
      name: loc.name,
      shortName,
      hasDiningArea: loc.has_dining_area,
      currentMode: loc.current_mode,
      ordersInKitchen: locActive.length,
      slaRed,
      slaAmber,
      vipCount,
      andonOpen: locAndon.length,
      andonRed,
      topStation: topStation
        ? { station: topStation.station_slug, utilization: Number(topStation.utilization) }
        : null,
      pulse: pulseSeries,
      revenueTodayCents: revenueToday,
      revenueYesterdayCents: revenueYesterday,
      managerName: typeof settings.manager_name === "string" ? settings.manager_name : null,
      managerWhatsapp: typeof settings.manager_whatsapp === "string" ? settings.manager_whatsapp : null,
      lat: loc.lat,
      lng: loc.lng,
    });
  }

  // ───── Comparatives ─────
  const revenueByLoc: CompareSeries[] = locations.map((loc) => {
    const locToday = todayOrders.filter((o) => o.location_id === loc.id);
    const today = locToday.reduce((a, o) => a + (o.total_cents ?? 0), 0);
    const yesterday = yesterdayOrders
      .filter((o) => o.location_id === loc.id)
      .reduce((a, o) => a + (o.total_cents ?? 0), 0);
    const todaySeries = bucketOrdersByHour(
      locToday.map((o) => ({ ts: o.placed_at, value: o.total_cents ?? 0 })),
      todayStart,
    );
    return {
      locationId: loc.id,
      shortName: loc.short_name ?? loc.name,
      value: today,
      valueYesterday: yesterday,
      todaySeries,
    };
  });

  const throughputByLoc: CompareSeries[] = locations.map((loc) => {
    const locToday = todayOrders.filter((o) => o.location_id === loc.id);
    const today = locToday.length;
    const yesterday = yesterdayOrders.filter((o) => o.location_id === loc.id).length;
    const todaySeries = bucketOrdersByHour(
      locToday.map((o) => ({ ts: o.placed_at, value: 1 })),
      todayStart,
    );
    return {
      locationId: loc.id,
      shortName: loc.short_name ?? loc.name,
      value: today,
      valueYesterday: yesterday,
      todaySeries,
    };
  });

  const npsByLoc = locations.map((loc) => {
    const rows = feedback.filter((f) => f.location_id === loc.id);
    return {
      locationId: loc.id,
      shortName: loc.short_name ?? loc.name,
      nps: computeNpsFromFeedback(rows),
      responses: rows.length,
    };
  });

  const slaHit = locations.map((loc) => {
    const locOrders = todayOrders.filter((o) => o.location_id === loc.id);
    const completed = locOrders.filter((o) => o.dispatched_at || o.delivered_at);
    if (completed.length === 0) {
      return {
        locationId: loc.id,
        shortName: loc.short_name ?? loc.name,
        pctOnTime: 100,
      };
    }
    const onTime = completed.filter((o) => {
      const out = o.delivered_at ?? o.dispatched_at;
      if (!out || !o.sla_target_at) return true;
      return new Date(out).getTime() <= new Date(o.sla_target_at).getTime();
    }).length;
    return {
      locationId: loc.id,
      shortName: loc.short_name ?? loc.name,
      pctOnTime: (onTime / completed.length) * 100,
    };
  });

  // ───── Attention + insight ─────
  const { computeLocationAttention } = await import("@/lib/kpis/network-health");
  const attention = signals.map((s) => computeLocationAttention(s));
  const insight = generateInsight({ signals, attention, locationNames });

  return {
    chainName,
    serverNow: now.toISOString(),
    heartbeat,
    insight,
    locations: summaries,
    signals,
    comparatives: {
      revenue: revenueByLoc,
      throughput: throughputByLoc,
      nps: npsByLoc,
      slaHit,
    },
  };
}

// ────────────────────────── helpers ──────────────────────────

function startOfArgentinaDay(d: Date): Date {
  // Argentina = UTC-3 (sin DST). Calculamos el offset directo para no depender de TZ del server.
  const ar = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  ar.setUTCHours(0, 0, 0, 0);
  return new Date(ar.getTime() + 3 * 60 * 60 * 1000);
}

function bucketByMinute(
  isoStrings: string[],
  windowStart: Date,
  windowMinutes: number,
): Array<{ minute: string; count: number }> {
  const buckets: number[] = Array.from({ length: windowMinutes }, () => 0);
  for (const iso of isoStrings) {
    const t = new Date(iso).getTime();
    const idx = Math.floor((t - windowStart.getTime()) / 60_000);
    if (idx >= 0 && idx < windowMinutes) buckets[idx]! += 1;
  }
  return buckets.map((count, i) => ({
    minute: new Date(windowStart.getTime() + i * 60_000).toISOString(),
    count,
  }));
}

function bucketOrdersByHour(
  rows: Array<{ ts: string; value: number }>,
  dayStart: Date,
): number[] {
  const out: number[] = Array.from({ length: 24 }, () => 0);
  for (const r of rows) {
    const t = new Date(r.ts).getTime();
    const hour = Math.floor((t - dayStart.getTime()) / (60 * 60 * 1000));
    if (hour >= 0 && hour < 24) out[hour] = (out[hour] ?? 0) + r.value;
  }
  return out;
}

/**
 * NPS Net Promoter desde star_rating (escala 1–5):
 * promotores = 5★, neutrales = 4★, detractores = 1–3★.
 * NPS = (% promotores − % detractores) × 100.
 */
function computeNpsFromFeedback(
  rows: Array<{ star_rating: number | null }>,
): number | null {
  const rated = rows.filter((r) => r.star_rating !== null) as Array<{ star_rating: number }>;
  if (rated.length === 0) return null;
  const promoters = rated.filter((r) => r.star_rating === 5).length;
  const detractors = rated.filter((r) => r.star_rating <= 3).length;
  return ((promoters - detractors) / rated.length) * 100;
}
