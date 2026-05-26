"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Toaster } from "sonner";
import { Activity, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  attentionBandColor,
  computeLocationAttention,
  computeNetworkHealth,
  type LocationSignal,
} from "@/lib/kpis/network-health";
import type { NocInsight } from "@/lib/kpis/insight";
import type { KitchenMode } from "@/lib/types/db-enums";
import { HeroBar } from "./HeroBar";
import { InsightStrip } from "./InsightStrip";
import { NetworkHeartbeat } from "./NetworkHeartbeat";
import { LocationCard, type NocLocationSummary } from "./LocationCard";
import { CordobaMap } from "./CordobaMap";
import { ComparativeBento, type CompareSeries } from "./ComparativeBento";
import { QuickActionsDialog } from "./QuickActionsDialog";

export type NocPayload = {
  chainName: string;
  serverNow: string;
  heartbeat: Array<{ minute: string; count: number }>;
  insight: NocInsight;
  locations: Array<NocLocationSummary & { lat: number | null; lng: number | null }>;
  signals: LocationSignal[];
  comparatives: {
    revenue: CompareSeries[];
    throughput: CompareSeries[];
    nps: Array<{ locationId: string; shortName: string; nps: number | null; responses: number }>;
    slaHit: Array<{ locationId: string; shortName: string; pctOnTime: number }>;
  };
};

export function NocVirtualV2({
  chainSlug,
  initialData,
}: {
  chainSlug: string;
  initialData: NocPayload;
}) {
  const [data, setData] = useState(initialData);
  const [turboTarget, setTurboTarget] = useState<{
    id: string;
    shortName: string;
    name: string;
    currentMode: KitchenMode;
  } | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setSyncing(true);
      const res = await fetch(`/api/noc/refresh?chain=${chainSlug}`, { cache: "no-store" });
      if (res.ok) {
        const fresh = (await res.json()) as NocPayload;
        setData(fresh);
        setLastSync(new Date());
      }
    } finally {
      setSyncing(false);
    }
  }, [chainSlug]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`noc:${chainSlug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_station_tasks" },
        () => {
          refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "andon_pulls" },
        () => {
          refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "locations" },
        () => {
          refresh();
        },
      )
      .subscribe();

    const heartbeatTick = setInterval(refresh, 30_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(heartbeatTick);
    };
  }, [chainSlug, refresh]);

  const health = useMemo(() => computeNetworkHealth(data.signals), [data.signals]);
  const attention = useMemo(
    () => data.signals.map((s) => computeLocationAttention(s)),
    [data.signals],
  );

  const ranked = useMemo(() => {
    const attentionById = new Map(attention.map((a) => [a.locationId, a]));
    return data.locations
      .map((loc) => ({
        loc,
        attention: attentionById.get(loc.id) ?? {
          locationId: loc.id,
          score: 0,
          band: "calm" as const,
          primaryReason: "Sin señales",
          secondaryReasons: [],
        },
      }))
      .sort((a, b) => b.attention.score - a.attention.score);
  }, [attention, data.locations]);

  const ordersInKitchen = data.signals.reduce((a, s) => a + s.ordersInKitchen, 0);
  const andonOpen = data.signals.reduce((a, s) => a + s.andonOpen, 0);
  const revenueToday = data.signals.reduce((a, s) => a + s.revenueTodayCents, 0);
  const locationsCalm = attention.filter((a) => a.band === "calm").length;
  const locationsUrgent = attention.filter((a) => a.band !== "calm").length;

  const pins = useMemo(
    () =>
      data.locations
        .filter((l) => l.lat !== null && l.lng !== null)
        .map((l) => ({
          id: l.id,
          slug: l.slug,
          name: l.name,
          shortName: l.shortName,
          lat: l.lat as number,
          lng: l.lng as number,
          attention:
            attention.find((a) => a.locationId === l.id) ?? {
              locationId: l.id,
              score: 0,
              band: "calm" as const,
              primaryReason: "",
              secondaryReasons: [],
            },
        })),
    [attention, data.locations],
  );

  const handleTurboClick = useCallback(
    (locId: string) => {
      const loc = data.locations.find((l) => l.id === locId);
      if (!loc) return;
      setTurboTarget({
        id: loc.id,
        shortName: loc.shortName,
        name: loc.name,
        currentMode: loc.currentMode,
      });
    },
    [data.locations],
  );

  return (
    <div className="space-y-5 pb-12">
      <Toaster position="top-center" theme="dark" toastOptions={{ duration: 4000 }} />

      <HeroBar
        chainName={data.chainName}
        health={health}
        ordersInKitchen={ordersInKitchen}
        andonOpen={andonOpen}
        revenueTodayCents={revenueToday}
        locationsCalm={locationsCalm}
        locationsUrgent={locationsUrgent}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <InsightStrip insight={data.insight} />
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 bg-card/60 px-3.5 py-2.5 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Activity className={`size-3 ${syncing ? "animate-pulse text-frich-yellow" : "text-signal-green"}`} />
            {syncing ? "Sincronizando" : "Conectado · realtime"}
          </span>
          <span className="font-mono tabular text-foreground/70">
            {lastSync.toLocaleTimeString("es-AR", { hour12: false })}
          </span>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <CordobaMap chainSlug={chainSlug} pins={pins} />
        <NetworkHeartbeat data={data.heartbeat} className="lg:h-full" />
      </section>

      <section>
        <header className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display brand-headline text-2xl text-frich-yellow">Triage</h2>
            <p className="text-xs text-muted-foreground">
              Locales ordenados por nivel de atención. El primero es donde mirar primero.
            </p>
          </div>
          {locationsCalm === ranked.length ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-signal-green/40 bg-signal-green/8 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-signal-green">
              <Sparkles className="size-3" />
              Red en banda
            </span>
          ) : null}
        </header>

        <motion.div layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ranked.map(({ loc, attention: att }, idx) => {
            const variant = idx === 0 && att.band !== "calm" ? "featured" : att.band === "calm" ? "dim" : "normal";
            return (
              <div
                key={loc.id}
                className={variant === "featured" ? "xl:col-span-2 xl:row-span-2" : undefined}
              >
                <LocationCard
                  chainSlug={chainSlug}
                  summary={loc}
                  attention={att}
                  variant={variant}
                  onTurboClick={handleTurboClick}
                />
              </div>
            );
          })}
        </motion.div>
      </section>

      <ComparativeBento
        revenue={data.comparatives.revenue}
        throughput={data.comparatives.throughput}
        npsRolling={data.comparatives.nps}
        slaHit={data.comparatives.slaHit}
      />

      <QuickActionsDialog
        open={turboTarget !== null}
        location={turboTarget}
        onOpenChange={(o) => {
          if (!o) setTurboTarget(null);
        }}
      />

      <footer className="pt-2 text-center text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground/70">
        NOC v2 · {ranked.length} locales · {ordersInKitchen} pedidos vivos ·{" "}
        {attention.filter((a) => attentionBandColor(a.band) === "red").length} en rojo
      </footer>
    </div>
  );
}
