"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, MessageCircle, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { attentionBandColor, attentionBandLabel, type LocationAttention } from "@/lib/kpis/network-health";
import type { KitchenMode } from "@/lib/types/db-enums";
import { Sparkline } from "./Sparkline";

export type NocLocationSummary = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  hasDiningArea: boolean;
  currentMode: KitchenMode;
  ordersInKitchen: number;
  slaRed: number;
  slaAmber: number;
  vipCount: number;
  andonOpen: number;
  andonRed: number;
  /** restricción más caliente: { station, utilization } */
  topStation: { station: string; utilization: number } | null;
  /** serie de pedidos por minuto últimos 30 min */
  pulse: number[];
  /** ARS revenue hoy / ayer en cents */
  revenueTodayCents: number;
  revenueYesterdayCents: number;
  managerName: string | null;
  managerWhatsapp: string | null;
};

type Variant = "featured" | "normal" | "dim";

const TONE_BORDER: Record<"red" | "amber" | "green" | "neutral", string> = {
  red: "border-signal-red/60 shadow-[0_0_0_1px_rgba(239,62,62,0.18)]",
  amber: "border-signal-amber/45",
  green: "border-signal-green/30",
  neutral: "border-border",
};
const TONE_GLOW: Record<"red" | "amber" | "green" | "neutral", string> = {
  red: "before:bg-signal-red",
  amber: "before:bg-signal-amber",
  green: "before:bg-signal-green",
  neutral: "before:bg-foreground/30",
};

export function LocationCard({
  chainSlug,
  summary,
  attention,
  variant = "normal",
  onTurboClick,
}: {
  chainSlug: string;
  summary: NocLocationSummary;
  attention: LocationAttention;
  variant?: Variant;
  onTurboClick: (locationId: string) => void;
}) {
  const tone = attentionBandColor(attention.band);
  const isFeatured = variant === "featured";
  const isDim = variant === "dim";

  const sparklineColor = tone === "red" ? "text-signal-red" : tone === "amber" ? "text-signal-amber" : "text-frich-yellow";
  const utilPct = summary.topStation ? Math.round(summary.topStation.utilization * 100) : 0;

  const revenueDelta =
    summary.revenueYesterdayCents > 0
      ? ((summary.revenueTodayCents - summary.revenueYesterdayCents) / summary.revenueYesterdayCents) * 100
      : 0;

  const dashboardHref = `/c/${chainSlug}/dashboard?loc=${summary.slug}`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isDim ? 0.62 : 1, y: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className={cn(
        "group relative isolate flex flex-col overflow-hidden rounded-2xl border bg-card/95 transition-colors",
        "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:transition-colors",
        TONE_BORDER[tone],
        TONE_GLOW[tone],
        isFeatured && "lg:row-span-2",
      )}
    >
      <header className="relative flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {summary.hasDiningArea ? "Salón + delivery" : "Delivery only"}
          </p>
          <h3
            className={cn(
              "mt-1 truncate font-sans font-bold tracking-tight",
              isFeatured ? "text-3xl md:text-4xl" : "text-2xl",
            )}
          >
            {summary.shortName}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground/80">{summary.name}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge tone={tone === "red" ? "red" : tone === "amber" ? "amber" : tone === "green" ? "green" : "default"}>
            {attentionBandLabel(attention.band)}
          </Badge>
          {summary.currentMode === "turbo" ? (
            <Badge tone="amber" className="gap-1">
              <Sparkles className="size-3" /> Turbo
            </Badge>
          ) : null}
          {summary.currentMode === "degraded" ? (
            <Badge tone="red" className="gap-1">
              ⚠ Degradado
            </Badge>
          ) : null}
        </div>
      </header>

      <section className="relative mt-3 px-5">
        <div
          className={cn(
            "rounded-xl border border-current/15 px-3.5 py-3",
            tone === "red" && "bg-signal-red/8 text-signal-red",
            tone === "amber" && "bg-signal-amber/8 text-signal-amber",
            tone === "green" && "bg-signal-green/6 text-signal-green",
            tone === "neutral" && "bg-muted/40 text-muted-foreground",
          )}
        >
          <p className="text-[0.55rem] uppercase tracking-[0.22em] opacity-90">Foco principal</p>
          <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{attention.primaryReason}</p>
          {attention.secondaryReasons.length > 0 ? (
            <ul className="mt-1 space-y-0.5 text-[0.7rem] text-foreground/65">
              {attention.secondaryReasons.map((r) => (
                <li key={r} className="flex items-start gap-1">
                  <span aria-hidden>·</span>
                  {r}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="relative grid grid-cols-4 gap-2 px-5 pt-4">
        <Cell label="Pedidos" value={summary.ordersInKitchen} mono />
        <Cell
          label="SLA red"
          value={summary.slaRed}
          tone={summary.slaRed > 0 ? "red" : "neutral"}
          mono
        />
        <Cell
          label="Andon"
          value={summary.andonOpen}
          tone={summary.andonRed > 0 ? "red" : summary.andonOpen > 0 ? "amber" : "neutral"}
          mono
        />
        <Cell label="VIP" value={summary.vipCount} mono />
      </section>

      <section className="relative px-5 pt-4">
        <div className="flex items-end justify-between text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Pedidos · últimos 30min</span>
          <span className="font-mono tabular">{summary.pulse.reduce((a, b) => a + b, 0)} acum</span>
        </div>
        <div className="mt-1.5 h-10 w-full">
          <Sparkline data={summary.pulse} stroke={sparklineColor} fill viewW={140} viewH={32} />
        </div>
      </section>

      <section className="relative grid grid-cols-2 gap-3 px-5 pt-3">
        <KV label="Restricción" value={summary.topStation ? `${summary.topStation.station} · ${utilPct}%` : "—"} tone={utilPct >= 85 ? "red" : utilPct >= 70 ? "amber" : "neutral"} />
        <KV
          label="Revenue hoy"
          value={`AR$ ${(summary.revenueTodayCents / 100_000).toFixed(0)}k`}
          delta={summary.revenueYesterdayCents > 0 ? revenueDelta : null}
        />
      </section>

      <footer className="relative mt-4 grid grid-cols-[1fr_auto] gap-2 border-t border-border/60 bg-background/30 px-4 py-3">
        {summary.managerWhatsapp && summary.managerName ? (
          <a
            href={`https://wa.me/${summary.managerWhatsapp}?text=${encodeURIComponent(
              `${summary.managerName}, te escribo desde el NOC sobre ${summary.shortName}. ${attention.primaryReason}.`,
            )}`}
            target="_blank"
            rel="noreferrer"
            className="group/wa inline-flex items-center justify-center gap-1.5 rounded-lg border border-signal-green/40 bg-signal-green/8 px-3 py-2 text-xs font-medium text-signal-green transition hover:bg-signal-green/15"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp {summary.managerName.split(" ")[0]}
          </a>
        ) : (
          <span className="inline-flex items-center justify-center text-[0.7rem] text-muted-foreground/70">
            Sin contacto de encargado
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onTurboClick(summary.id)}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-medium transition",
              summary.currentMode === "turbo"
                ? "border-frich-yellow bg-frich-yellow text-frich-carbon hover:bg-frich-yellow-hot"
                : "border-border bg-card/90 text-foreground/85 hover:border-frich-yellow/50",
            )}
            aria-label="Cambiar modo operativo"
          >
            <Zap className="size-3.5" />
            Modo
          </button>
          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card/90 px-2.5 py-2 text-xs font-medium text-foreground/85 transition hover:border-frich-yellow/50 hover:text-frich-yellow"
          >
            Abrir
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </footer>
    </motion.article>
  );
}

function Cell({
  label,
  value,
  tone = "neutral",
  mono = false,
}: {
  label: string;
  value: number;
  tone?: "neutral" | "red" | "amber" | "green";
  mono?: boolean;
}) {
  const toneCls =
    tone === "red"
      ? "text-signal-red"
      : tone === "amber"
        ? "text-signal-amber"
        : tone === "green"
          ? "text-signal-green"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-2.5 py-2">
      <p className="text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-xl", mono && "font-mono tabular", toneCls)}>{value}</p>
    </div>
  );
}

function KV({
  label,
  value,
  tone = "neutral",
  delta = null,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "red" | "amber" | "green";
  delta?: number | null;
}) {
  const toneCls =
    tone === "red"
      ? "text-signal-red"
      : tone === "amber"
        ? "text-signal-amber"
        : tone === "green"
          ? "text-signal-green"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
      <p className="text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-mono text-sm tabular capitalize", toneCls)}>{value}</p>
      {delta !== null ? (
        <p
          className={cn(
            "mt-0.5 font-mono text-[0.65rem] tabular",
            delta >= 0 ? "text-signal-green" : "text-signal-red",
          )}
        >
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(0)}% vs ayer
        </p>
      ) : null}
    </div>
  );
}
