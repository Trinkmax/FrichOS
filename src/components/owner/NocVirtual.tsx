"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldAlert, Sparkles, TrendingUp, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { signalClasses } from "@/lib/design/tokens";
import { fadeUp } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";
import { rankBottleneck, type StationLiveMetrics } from "@/lib/kpis/bottleneck";

type Snapshot = {
  location: {
    id: string;
    slug: string;
    name: string;
    shortName: string;
    hasDiningArea: boolean;
    currentMode: string;
  };
  ordersInKitchen: number;
  slaRed: number;
  vipCount: number;
  andonOpen: number;
  andonRed: number;
  metrics: Array<{
    station_slug: string;
    utilization: number;
    queue_depth: number;
    eta_to_idle_sec: number;
  }>;
};

export function NocVirtual({
  chainSlug,
  snapshots,
}: {
  chainSlug: string;
  snapshots: Snapshot[];
}) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("es-AR", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const totalOrders = snapshots.reduce((a, s) => a + s.ordersInKitchen, 0);
  const totalRed = snapshots.reduce((a, s) => a + s.slaRed, 0);
  const totalAndon = snapshots.reduce((a, s) => a + s.andonOpen, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            Anillo 2 · Vista del owner
          </p>
          <h1 className="font-display brand-headline-lg text-4xl text-frich-yellow md:text-5xl">NOC Virtual</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Los 4 locales en una pantalla. Lo que está dentro de banda se desvanece.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-1.5 text-xs">
          <Wifi className="size-3.5 text-signal-green" />
          <span className="font-mono text-muted-foreground">{now}</span>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryTile label="Pedidos en red" value={totalOrders} tone="yellow" />
        <SummaryTile label="SLA en rojo" value={totalRed} tone={totalRed > 0 ? "red" : "green"} />
        <SummaryTile label="Andon abiertos" value={totalAndon} tone={totalAndon > 0 ? "red" : "green"} />
        <SummaryTile label="Locales" value={snapshots.length} tone="yellow" />
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {snapshots.map((s, i) => {
          const ranked = rankBottleneck(
            s.metrics.map((m) => ({
              station: m.station_slug as StationLiveMetrics["station"],
              queueDepth: m.queue_depth,
              utilization: m.utilization,
              etaToIdleSeconds: m.eta_to_idle_sec,
            })),
          );
          const top = ranked[0];
          const hot = (s.andonRed > 0) || (s.slaRed > 0) || (top?.pressure ?? 0) > 0.55;
          return (
            <motion.div
              key={s.location.id}
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/c/${chainSlug}/dashboard?loc=${s.location.slug}`}
                className={cn(
                  "group block h-full rounded-2xl border bg-card/90 p-5 transition-all hover:bg-card",
                  hot ? signalClasses.border.red : "border-border hover:border-frich-yellow/40",
                  hot ? "opacity-100" : "opacity-95",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {s.location.hasDiningArea ? "Salón + delivery" : "Delivery only"}
                    </p>
                    <h3 className="mt-1 font-sans font-bold text-2xl tracking-tight">{s.location.shortName}</h3>
                  </div>
                  {s.location.currentMode === "turbo" && (
                    <Badge tone="amber" className="gap-1">
                      <Sparkles className="size-3" />
                      Turbo
                    </Badge>
                  )}
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <Stat label="Pedidos" value={s.ordersInKitchen} mono />
                  <Stat label="SLA rojo" value={s.slaRed} tone={s.slaRed > 0 ? "red" : "green"} mono />
                  <Stat label="VIP" value={s.vipCount} mono />
                  <Stat
                    label="Andon"
                    value={s.andonOpen}
                    tone={s.andonRed > 0 ? "red" : s.andonOpen > 0 ? "amber" : "green"}
                    mono
                  />
                </dl>

                <div className="mt-4 rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Restricción
                  </p>
                  {top && top.pressure > 0.3 ? (
                    <p className="mt-0.5 font-mono text-sm capitalize">
                      {top.station} <span className="text-muted-foreground">· {top.reason}</span>
                    </p>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted-foreground">Sin cuello visible</p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Detalle del local</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SecondaryCard title="Kaizen pendientes" body="3 hipótesis abiertas esta semana. Revisar en Anillo 3 → Kaizen." icon={<TrendingUp className="size-5" />} href={`/c/${chainSlug}/kaizen`} />
        <SecondaryCard title="Score repartidores" body="Pendiente datos reales de Rappi/PY. Mock activo." icon={<ShieldAlert className="size-5" />} href={`/c/${chainSlug}/dispatch`} />
        <SecondaryCard title="Cross-pollination" body="Práctica destacada: Jesús María lidera tiempos en plancha esta semana." icon={<Sparkles className="size-5" />} href={`/c/${chainSlug}/kaizen`} />
      </section>
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: "yellow" | "green" | "red" | "amber" }) {
  const color = { yellow: "text-frich-yellow", green: "text-signal-green", red: "text-signal-red", amber: "text-signal-amber" }[tone];
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className={cn("mt-1 font-mono text-3xl font-semibold tabular", color)}>{value}</p>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, tone, mono }: { label: string; value: number; tone?: "green" | "amber" | "red"; mono?: boolean }) {
  const toneColor = tone === "red" ? "text-signal-red" : tone === "amber" ? "text-signal-amber" : tone === "green" ? "text-signal-green" : "text-foreground";
  return (
    <div>
      <dt className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={cn("text-xl", mono && "font-mono tabular", toneColor)}>{value}</dd>
    </div>
  );
}

function SecondaryCard({ title, body, icon, href }: { title: string; body: string; icon: React.ReactNode; href: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-border bg-muted/40 p-5 transition-colors hover:border-frich-yellow/40"
    >
      <div className="flex items-center gap-2 text-frich-yellow">{icon} <span className="text-sm font-semibold">{title}</span></div>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-frich-yellow">
        Abrir <ArrowRight className="size-3.5" />
      </div>
    </Link>
  );
}
