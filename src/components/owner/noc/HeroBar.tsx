"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Activity, Bell, Wifi } from "lucide-react";
import { HealthRing, HealthBandPill } from "./HealthRing";
import type { NetworkHealth } from "@/lib/kpis/network-health";
import { cn } from "@/lib/utils/cn";

type Props = {
  chainName: string;
  health: NetworkHealth;
  ordersInKitchen: number;
  andonOpen: number;
  /** revenue del día en cents */
  revenueTodayCents: number;
  /** total locations en banda */
  locationsCalm: number;
  /** total locations en alerta */
  locationsUrgent: number;
};

export function HeroBar({
  chainName,
  health,
  ordersInKitchen,
  andonOpen,
  revenueTodayCents,
  locationsCalm,
  locationsUrgent,
}: Props) {
  const [now, setNow] = useState<string>("");
  const [day, setDay] = useState<string>("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d.toLocaleTimeString("es-AR", { hour12: false }));
      setDay(d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const revenue = (revenueTodayCents / 100_000).toLocaleString("es-AR", { maximumFractionDigits: 0 });

  return (
    <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-card/40 px-6 py-6">
      <div className="absolute inset-0 grid-overlay-yellow opacity-50" aria-hidden />
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-frich-yellow/[0.05] blur-3xl" aria-hidden />

      <div className="relative grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="grid place-items-center"
        >
          <HealthRing health={health} />
        </motion.div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
            <span>Anillo 2 · NOC</span>
            <span aria-hidden>·</span>
            <span>{chainName}</span>
          </div>
          <h1 className="mt-2 font-display brand-headline-lg text-5xl text-frich-yellow md:text-6xl">
            La red, de un vistazo.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {health.headline} <span className="text-foreground/70">Lo que está en banda se desvanece. Lo urgente emerge.</span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <HealthBandPill band={health.band} />
            <StatChip
              icon={<Activity className="size-3.5" />}
              label="En cocina"
              value={`${ordersInKitchen}`}
            />
            <StatChip
              icon={<Bell className="size-3.5" />}
              label="Andon abiertos"
              value={`${andonOpen}`}
              tone={andonOpen > 0 ? "red" : "neutral"}
            />
            <StatChip label="Revenue hoy" value={`AR$ ${revenue}k`} tone="yellow" />
            <StatChip
              label="Locales en banda"
              value={`${locationsCalm} de ${locationsCalm + locationsUrgent}`}
              tone={locationsUrgent === 0 ? "green" : "amber"}
            />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-3 py-1.5 backdrop-blur">
            <Wifi className="size-3.5 text-signal-green" />
            <span className="font-mono text-sm tabular text-foreground/90">{now}</span>
          </div>
          <p className="text-xs capitalize text-muted-foreground">{day}</p>
        </div>
      </div>
    </header>
  );
}

function StatChip({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  tone?: "neutral" | "red" | "amber" | "green" | "yellow";
}) {
  const toneCls = {
    neutral: "text-foreground/80 border-border/70 bg-background/40",
    red: "text-signal-red border-signal-red/40 bg-signal-red/8",
    amber: "text-signal-amber border-signal-amber/45 bg-signal-amber/8",
    green: "text-signal-green border-signal-green/40 bg-signal-green/8",
    yellow: "text-frich-yellow border-frich-yellow/40 bg-frich-yellow/10",
  }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs", toneCls)}>
      {icon}
      <span className="font-mono tabular">{value}</span>
      <span className="text-[0.6rem] uppercase tracking-[0.18em] opacity-70">{label}</span>
    </span>
  );
}
