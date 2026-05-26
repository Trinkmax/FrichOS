"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  AlertTriangle,
  Bike,
  Clock,
  Flame,
  Gauge,
  Hand,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveTicker } from "@/components/motion/LiveTicker";
import { signalClasses, slaLevel } from "@/lib/design/tokens";
import { springs, fadeUp } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";
import { rankBottleneck, isBottleneck, bottleneckAdvice, type StationLiveMetrics } from "@/lib/kpis/bottleneck";
import { createClient } from "@/lib/supabase/client";

type Location = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  hasDiningArea: boolean;
  currentMode?: "normal" | "turbo" | "degraded" | "opening" | "closing";
};

type ActiveOrder = {
  id: string;
  order_code: string;
  channel: string;
  is_vip: boolean;
  complexity_score: number;
  status: string;
  customer_name: string | null;
  placed_at: string;
  sla_target_at: string;
  sla_remaining_sec: number;
  pending_tasks: number;
  done_tasks: number;
  total_tasks: number;
};

type Task = {
  task_id: string;
  station_slug: string;
  product_name: string;
  status: string;
  start_target_at: string;
  target_seconds: number;
};

type AndonRow = {
  id: string;
  state: string;
  triggered_at: string;
  station_slug: string | null;
  note: string | null;
  andon_categories: { name: string; color: string | null } | null;
};

type StationMetricRow = {
  location_id: string;
  station_slug: string;
  queue_depth: number;
  eta_to_idle_sec: number;
  utilization: number;
};

export function LocationDashboard({
  chainSlug,
  locations,
  activeLocation,
  orders: initialOrders,
  tasks: initialTasks,
  andon: initialAndon,
  metrics: initialMetrics,
}: {
  chainSlug: string;
  locations: Location[];
  activeLocation: Location;
  orders: ActiveOrder[];
  tasks: Task[];
  andon: AndonRow[];
  metrics: StationMetricRow[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [tasks, setTasks] = useState(initialTasks);
  const [andon, setAndon] = useState(initialAndon);
  const [metrics, setMetrics] = useState(initialMetrics);

  // Realtime subscription — orders + tasks + andon on this location
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dash:${activeLocation.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_station_tasks" },
        async () => {
          const fresh = await fetch(
            `/api/dashboard/refresh?location=${activeLocation.id}`,
            { cache: "no-store" },
          );
          if (fresh.ok) {
            const data = (await fresh.json()) as {
              orders: ActiveOrder[];
              tasks: Task[];
              andon: AndonRow[];
              metrics: StationMetricRow[];
            };
            setOrders(data.orders);
            setTasks(data.tasks);
            setAndon(data.andon);
            setMetrics(data.metrics);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "andon_pulls" },
        async () => {
          const fresh = await fetch(
            `/api/dashboard/refresh?location=${activeLocation.id}`,
            { cache: "no-store" },
          );
          if (fresh.ok) {
            const data = (await fresh.json()) as {
              orders: ActiveOrder[];
              tasks: Task[];
              andon: AndonRow[];
              metrics: StationMetricRow[];
            };
            setOrders(data.orders);
            setTasks(data.tasks);
            setAndon(data.andon);
            setMetrics(data.metrics);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeLocation.id]);

  const bottleneck = useMemo(() => {
    const ranked = rankBottleneck(
      metrics.map(
        (m) =>
          ({
            station: m.station_slug as StationLiveMetrics["station"],
            queueDepth: m.queue_depth,
            utilization: m.utilization,
            etaToIdleSeconds: m.eta_to_idle_sec,
          }) satisfies StationLiveMetrics,
      ),
    );
    return ranked[0];
  }, [metrics]);

  const totalRevenue = useMemo(() => {
    // Quick approx for the demo
    return orders.length * 13000;
  }, [orders.length]);

  const slaInRedPct = useMemo(() => {
    const total = orders.length;
    if (total === 0) return 0;
    const red = orders.filter((o) => o.sla_remaining_sec < 0).length;
    return Math.round((red / total) * 100);
  }, [orders]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            Operación · {activeLocation.hasDiningArea ? "Con salón" : "Delivery only"}
          </p>
          <h1 className="mt-1 font-display brand-headline-lg text-4xl text-frich-yellow md:text-5xl">
            {activeLocation.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lo que está dentro de banda se desvanece. Lo que requiere atención emerge.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {locations.map((l) => (
            <Link
              key={l.id}
              href={`/c/${chainSlug}/dashboard?loc=${l.slug}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition",
                l.id === activeLocation.id
                  ? "border-frich-yellow bg-frich-yellow text-frich-carbon font-semibold"
                  : "border-border bg-card/90 text-foreground/80 hover:border-frich-yellow/40",
              )}
            >
              {l.shortName}
              {!l.hasDiningArea ? (
                <span className="font-mono text-[0.55rem] uppercase tracking-wider opacity-70">
                  delivery
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricTile
          icon={<Flame className="size-4" />}
          label="En cocina"
          value={orders.length}
          unit="pedidos"
          accent="yellow"
        />
        <MetricTile
          icon={<Clock className="size-4" />}
          label="SLA en rojo"
          value={slaInRedPct}
          unit="%"
          accent={slaInRedPct > 20 ? "red" : slaInRedPct > 10 ? "amber" : "green"}
        />
        <MetricTile
          icon={<Hand className="size-4" />}
          label="Andon activos"
          value={andon.length}
          unit="abiertos"
          accent={andon.length > 0 ? "red" : "green"}
        />
        <MetricTile
          icon={<TrendingUp className="size-4" />}
          label="Revenue parcial"
          value={`$${(totalRevenue / 1000).toFixed(0)}k`}
          unit="ARS"
          accent="yellow"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <BottleneckCard
          metrics={metrics}
          bottleneck={bottleneck}
        />
        <KitchenModeCard mode={activeLocation.currentMode ?? "normal"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <KitchenMosaic
          chainSlug={chainSlug}
          locationSlug={activeLocation.slug}
          metrics={metrics}
          tasks={tasks}
        />
        <div className="space-y-4">
          <AndonRail andon={andon} />
          <ActiveOrdersRail orders={orders.slice(0, 12)} />
        </div>
      </section>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  unit?: string;
  accent: "yellow" | "green" | "amber" | "red";
}) {
  const accentColor = {
    yellow: "text-frich-yellow",
    green: "text-signal-green",
    amber: "text-signal-amber",
    red: "text-signal-red",
  }[accent];
  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate">
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.65rem] uppercase tracking-[0.18em]">{label}</span>
            <span className={cn("grid size-7 place-items-center rounded-md bg-card", accentColor)}>
              {icon}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className={cn("font-mono text-3xl font-semibold tabular", accentColor)}>{value}</span>
            {unit ? <span className="text-xs uppercase tracking-wider text-muted-foreground">{unit}</span> : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BottleneckCard({
  metrics,
  bottleneck,
}: {
  metrics: StationMetricRow[];
  bottleneck: { station: StationLiveMetrics["station"]; pressure: number; reason: string } | undefined;
}) {
  const hasBottleneck = bottleneck ? isBottleneck(bottleneck) : false;
  const advice = bottleneck ? bottleneckAdvice(bottleneck) : "Cocina ociosa.";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Restricción ahora (DBR)
            </p>
            <h2 className="mt-1 font-sans font-bold text-3xl tracking-tight text-foreground">
              {hasBottleneck ? bottleneck!.station : "Sin cuello"}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{advice}</p>
          </div>
          <div className={cn("rounded-xl border p-3", hasBottleneck ? "border-signal-amber/40 bg-signal-amber/10 text-signal-amber" : "border-signal-green/40 bg-signal-green/10 text-signal-green")}>
            <Gauge className="size-6" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {metrics.map((m) => {
            const isTop = bottleneck?.station === m.station_slug && hasBottleneck;
            const level = m.utilization > 0.85 ? "red" : m.utilization > 0.65 ? "amber" : "green";
            const pct = Math.round(m.utilization * 100);
            return (
              <div
                key={m.station_slug}
                className={cn(
                  "rounded-xl border p-3 transition-colors",
                  isTop ? "border-signal-amber bg-signal-amber/8" : signalClasses.border[level],
                )}
              >
                <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {m.station_slug}
                </p>
                <p className={cn("mt-1 font-mono text-2xl font-semibold tabular", isTop ? "text-signal-amber" : "text-foreground")}>
                  {pct}%
                </p>
                <p className="font-mono text-[0.65rem] text-muted-foreground">
                  cola {m.queue_depth} · ETA {Math.round(m.eta_to_idle_sec / 60)}m
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function KitchenModeCard({ mode }: { mode: "normal" | "turbo" | "degraded" | "opening" | "closing" }) {
  const modeMap = {
    normal: { label: "Normal", color: "text-foreground", body: "Todos los módulos activos. Sin restricciones." },
    turbo: { label: "Turbo", color: "text-signal-amber", body: "Buffer aumentado, ítems lentos desactivados, VIP routing activo." },
    degraded: { label: "Degradado", color: "text-signal-red", body: "Sin internet — KDS funcionando con datos locales. Impresora térmica activa." },
    opening: { label: "Apertura", color: "text-signal-green", body: "Checklist de apertura + par levels iniciales." },
    closing: { label: "Cierre", color: "text-frich-yellow", body: "Conciliación de inventario y reporte automático." },
  } as const;
  const m = modeMap[mode];
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Modo operativo</p>
        <div className="mt-1 flex items-center gap-3">
          <Zap className={cn("size-6", m.color)} />
          <h2 className={cn("font-sans font-bold text-3xl tracking-tight", m.color)}>{m.label}</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{m.body}</p>
      </CardContent>
    </Card>
  );
}

function KitchenMosaic({
  chainSlug,
  locationSlug,
  metrics,
  tasks,
}: {
  chainSlug: string;
  locationSlug: string;
  metrics: StationMetricRow[];
  tasks: Task[];
}) {
  const byStation = useMemo(() => {
    return {
      armado: tasks.filter((t) => t.station_slug === "armado").slice(0, 5),
      plancha: tasks.filter((t) => t.station_slug === "plancha").slice(0, 5),
      freidora: tasks.filter((t) => t.station_slug === "freidora").slice(0, 5),
      despacho: tasks.filter((t) => t.station_slug === "despacho").slice(0, 5),
    } as const;
  }, [tasks]);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Mosaico KDS
            </p>
            <h2 className="font-sans font-bold text-2xl tracking-tight">Cocina en vivo</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Tap una estación para abrir el KDS dedicado
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {(["armado", "plancha", "freidora", "despacho"] as const).map((slug) => {
            const m = metrics.find((x) => x.station_slug === slug);
            const level = !m ? "neutral" : m.utilization > 0.85 ? "red" : m.utilization > 0.65 ? "amber" : "green";
            return (
              <Link
                key={slug}
                href={`/c/${chainSlug}/kds/${slug}`}
                className={cn(
                  "group block rounded-2xl border bg-card/90 p-4 transition-colors",
                  signalClasses.border[level],
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Estación</p>
                    <p className="font-sans font-bold text-2xl tracking-tight capitalize">{slug}</p>
                  </div>
                  <Badge tone={level === "red" ? "red" : level === "amber" ? "amber" : "green"}>
                    {m ? `${Math.round(m.utilization * 100)}%` : "—"}
                  </Badge>
                </div>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  cola {m?.queue_depth ?? 0} · ETA {Math.round((m?.eta_to_idle_sec ?? 0) / 60)}m
                </p>
                <ul className="mt-3 space-y-1.5">
                  <AnimatePresence initial={false}>
                    {byStation[slug].map((t) => {
                      const elapsed = Math.max(0, (Date.now() - new Date(t.start_target_at).getTime()) / 1000);
                      const sLevel = slaLevel(elapsed, t.target_seconds);
                      return (
                        <motion.li
                          key={t.task_id}
                          layout
                          variants={fadeUp}
                          initial="initial"
                          animate="animate"
                          exit={{ opacity: 0, x: 12, transition: springs.ambient }}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-sm"
                        >
                          <span className="truncate">{t.product_name}</span>
                          <LiveTicker
                            startedAt={t.start_target_at}
                            targetSeconds={t.target_seconds}
                            className={cn(
                              "font-mono text-xs",
                              sLevel === "red" && "text-signal-red",
                              sLevel === "amber" && "text-signal-amber",
                              sLevel === "green" && "text-signal-green",
                            )}
                            showSign
                          />
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                  {byStation[slug].length === 0 ? (
                    <li className="rounded-lg border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground/70">
                      Estación en banda · sin pedidos
                    </li>
                  ) : null}
                </ul>
              </Link>
            );
          })}
        </div>
        <p className="mt-3 text-[0.65rem] text-muted-foreground/70">
          Mostrando 5 de cada cola · vista compacta. <code>{locationSlug}</code>
        </p>
      </CardContent>
    </Card>
  );
}

function AndonRail({ andon }: { andon: AndonRow[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Andon</p>
            <h2 className="font-sans font-bold text-2xl tracking-tight">Cable Andon</h2>
          </div>
          <Badge tone={andon.length > 0 ? "red" : "green"}>
            {andon.length} {andon.length === 1 ? "abierto" : "abiertos"}
          </Badge>
        </div>
        <div className="mt-4 space-y-2">
          <AnimatePresence initial={false}>
            {andon.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-xs text-muted-foreground">
                Línea fluyendo. Sin incidentes abiertos.
              </p>
            ) : (
              andon.map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, transition: springs.ambient }}
                  className={cn(
                    "rounded-xl border p-3",
                    a.andon_categories?.color === "red"
                      ? "border-signal-red/40 bg-signal-red/10"
                      : "border-signal-amber/40 bg-signal-amber/8",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-signal-amber" />
                      <p className="font-medium">{a.andon_categories?.name ?? "Andon"}</p>
                    </div>
                    <Badge tone={a.andon_categories?.color === "red" ? "red" : "amber"}>{a.state}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {a.station_slug ? `Estación ${a.station_slug}` : "Local"} ·{" "}
                    {new Date(a.triggered_at).toLocaleTimeString("es-AR")}
                  </p>
                  {a.note ? <p className="mt-2 text-sm text-foreground/80">{a.note}</p> : null}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveOrdersRail({ orders }: { orders: ActiveOrder[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Pedidos en vuelo
            </p>
            <h2 className="font-sans font-bold text-2xl tracking-tight">{orders.length} activos</h2>
          </div>
          <Users className="size-5 text-muted-foreground" />
        </div>
        <ul className="mt-3 space-y-2">
          <AnimatePresence initial={false}>
            {orders.map((o) => {
              const remaining = o.sla_remaining_sec;
              const level = remaining < 0 ? "red" : remaining < 120 ? "amber" : "green";
              return (
                <motion.li
                  key={o.id}
                  layout
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, transition: springs.ambient }}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border bg-background/70 px-3 py-2",
                    signalClasses.border[level],
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Bike className="size-4 text-muted-foreground" />
                    <span className="truncate font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {o.channel}
                    </span>
                    <span className="truncate text-sm">{o.customer_name ?? "—"}</span>
                    {o.is_vip ? <Badge tone="yellow">VIP</Badge> : null}
                  </div>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      level === "red" && "text-signal-red",
                      level === "amber" && "text-signal-amber",
                      level === "green" && "text-signal-green",
                    )}
                  >
                    {remaining < 0 ? "+" : ""}{Math.abs(Math.round(remaining / 60))}m
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </CardContent>
    </Card>
  );
}
