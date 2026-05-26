"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Coins, Smile, Timer, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Sparkline } from "./Sparkline";

export type CompareSeries = {
  locationId: string;
  shortName: string;
  /** valor agregado del día */
  value: number;
  /** valor agregado del mismo período de ayer */
  valueYesterday: number;
  /** serie temporal hoy (24h en buckets de 1h) */
  todaySeries: number[];
};

type Props = {
  revenue: CompareSeries[];
  throughput: CompareSeries[];
  npsRolling: Array<{ locationId: string; shortName: string; nps: number | null; responses: number }>;
  slaHit: Array<{ locationId: string; shortName: string; pctOnTime: number }>;
  className?: string;
};

export function ComparativeBento({ revenue, throughput, npsRolling, slaHit, className }: Props) {
  return (
    <section className={cn("grid gap-4 md:grid-cols-2", className)}>
      <RevenueCard data={revenue} />
      <ThroughputCard data={throughput} />
      <NpsCard data={npsRolling} />
      <SlaCard data={slaHit} />
    </section>
  );
}

function RevenueCard({ data }: { data: CompareSeries[] }) {
  const total = data.reduce((a, s) => a + s.value, 0);
  const yesterday = data.reduce((a, s) => a + s.valueYesterday, 0);
  const delta = yesterday > 0 ? ((total - yesterday) / yesterday) * 100 : 0;
  return (
    <BentoCard
      icon={<Coins className="size-4" />}
      title="Revenue del día"
      subtitle="por local · vs mismo momento de ayer"
      headlineValue={`AR$ ${(total / 100_000).toLocaleString("es-AR", { maximumFractionDigits: 0 })}k`}
      headlineDelta={yesterday > 0 ? delta : null}
      tone="yellow"
    >
      <ul className="space-y-2">
        {data
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((s) => {
            const sDelta =
              s.valueYesterday > 0 ? ((s.value - s.valueYesterday) / s.valueYesterday) * 100 : 0;
            return (
              <li key={s.locationId} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-1.5">
                <span className="truncate text-xs text-foreground/85">{s.shortName}</span>
                <span className="font-mono text-xs tabular text-foreground">
                  ${(s.value / 100_000).toFixed(0)}k
                </span>
                <DeltaPill delta={s.valueYesterday > 0 ? sDelta : null} />
              </li>
            );
          })}
      </ul>
    </BentoCard>
  );
}

function ThroughputCard({ data }: { data: CompareSeries[] }) {
  const total = data.reduce((a, s) => a + s.value, 0);
  const yesterday = data.reduce((a, s) => a + s.valueYesterday, 0);
  const delta = yesterday > 0 ? ((total - yesterday) / yesterday) * 100 : 0;
  const network = mergeSeries(data.map((s) => s.todaySeries));
  return (
    <BentoCard
      icon={<TrendingUp className="size-4" />}
      title="Throughput"
      subtitle="pedidos hoy · curva por hora"
      headlineValue={`${total}`}
      headlineDelta={yesterday > 0 ? delta : null}
      tone="green"
    >
      <div className="h-16 w-full">
        <Sparkline data={network.length > 1 ? network : [0, 0]} stroke="text-signal-green" fill viewW={140} viewH={36} />
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-1.5">
        {data.map((s) => {
          const dt = s.valueYesterday > 0 ? ((s.value - s.valueYesterday) / s.valueYesterday) * 100 : 0;
          return (
            <li
              key={s.locationId}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 px-2.5 py-1.5"
            >
              <span className="truncate text-[0.7rem] text-foreground/85">{s.shortName}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xs tabular">{s.value}</span>
                <DeltaPill delta={s.valueYesterday > 0 ? dt : null} small />
              </div>
            </li>
          );
        })}
      </ul>
    </BentoCard>
  );
}

function NpsCard({ data }: { data: Props["npsRolling"] }) {
  const withData = data.filter((d) => d.nps !== null && d.responses > 0);
  const mean =
    withData.length > 0
      ? withData.reduce((a, b) => a + (b.nps ?? 0), 0) / withData.length
      : null;
  return (
    <BentoCard
      icon={<Smile className="size-4" />}
      title="NPS móvil 7d"
      subtitle="conversación con el cliente"
      headlineValue={mean !== null ? `${mean.toFixed(0)}` : "—"}
      tone={mean === null ? "neutral" : mean >= 50 ? "green" : mean >= 20 ? "amber" : "red"}
    >
      <ul className="space-y-2">
        {data.map((d) => (
          <li
            key={d.locationId}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-1.5"
          >
            <span className="truncate text-xs text-foreground/85">{d.shortName}</span>
            <span className={cn("font-mono text-xs tabular", d.nps === null && "text-muted-foreground")}>
              {d.nps !== null ? d.nps.toFixed(0) : "sin datos"}
            </span>
            <span className="font-mono text-[0.65rem] text-muted-foreground">
              n={d.responses}
            </span>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

function SlaCard({ data }: { data: Props["slaHit"] }) {
  const mean =
    data.length > 0 ? data.reduce((a, b) => a + b.pctOnTime, 0) / data.length : 0;
  return (
    <BentoCard
      icon={<Timer className="size-4" />}
      title="SLA hit %"
      subtitle="pedidos a tiempo · acumulado del día"
      headlineValue={`${Math.round(mean)}%`}
      tone={mean >= 92 ? "green" : mean >= 80 ? "amber" : "red"}
    >
      <ul className="space-y-2">
        {data
          .slice()
          .sort((a, b) => a.pctOnTime - b.pctOnTime)
          .map((d) => {
            const tone = d.pctOnTime >= 92 ? "green" : d.pctOnTime >= 80 ? "amber" : "red";
            return (
              <li key={d.locationId} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate text-foreground/85">{d.shortName}</span>
                  <span
                    className={cn(
                      "font-mono tabular",
                      tone === "green" && "text-signal-green",
                      tone === "amber" && "text-signal-amber",
                      tone === "red" && "text-signal-red",
                    )}
                  >
                    {Math.round(d.pctOnTime)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, d.pctOnTime)}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "h-full rounded-full",
                      tone === "green" && "bg-signal-green",
                      tone === "amber" && "bg-signal-amber",
                      tone === "red" && "bg-signal-red",
                    )}
                  />
                </div>
              </li>
            );
          })}
      </ul>
    </BentoCard>
  );
}

function BentoCard({
  icon,
  title,
  subtitle,
  headlineValue,
  headlineDelta,
  tone = "neutral",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  headlineValue: string;
  headlineDelta?: number | null;
  tone?: "green" | "amber" | "red" | "yellow" | "neutral";
  children: React.ReactNode;
}) {
  const toneCls = {
    green: "text-signal-green",
    amber: "text-signal-amber",
    red: "text-signal-red",
    yellow: "text-frich-yellow",
    neutral: "text-foreground",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border bg-card/95 p-5"
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
            <span className={toneCls}>{icon}</span>
            {title}
          </p>
          <p className="mt-0.5 text-[0.65rem] text-muted-foreground/80">{subtitle}</p>
        </div>
      </header>
      <div className="mt-3 flex items-baseline gap-3">
        <span className={cn("font-mono text-3xl font-semibold tabular", toneCls)}>{headlineValue}</span>
        {headlineDelta != null ? <DeltaPill delta={headlineDelta} /> : null}
      </div>
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

function DeltaPill({ delta, small = false }: { delta: number | null; small?: boolean }) {
  if (delta === null) {
    return (
      <span className={cn("font-mono text-muted-foreground/70", small ? "text-[0.6rem]" : "text-[0.7rem]")}>—</span>
    );
  }
  const positive = delta >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono tabular",
        small ? "text-[0.55rem]" : "text-[0.65rem]",
        positive
          ? "bg-signal-green/15 text-signal-green"
          : "bg-signal-red/15 text-signal-red",
      )}
    >
      {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(delta).toFixed(0)}%
    </span>
  );
}

function mergeSeries(series: number[][]): number[] {
  if (series.length === 0) return [];
  const len = Math.max(...series.map((s) => s.length));
  const out: number[] = [];
  for (let i = 0; i < len; i += 1) {
    let sum = 0;
    for (const s of series) sum += s[i] ?? 0;
    out.push(sum);
  }
  return out;
}
