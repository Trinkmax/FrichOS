"use client";

import { motion } from "motion/react";
import { Sparkles, AlertTriangle, TrendingUp, Coffee } from "lucide-react";
import type { NocInsight } from "@/lib/kpis/insight";
import { cn } from "@/lib/utils/cn";

const TONE_STYLE: Record<NocInsight["tone"], { icon: React.ReactNode; ring: string; bar: string; text: string }> = {
  urgent: {
    icon: <AlertTriangle className="size-4" />,
    ring: "border-signal-red/45 bg-signal-red/8",
    bar: "bg-signal-red",
    text: "text-signal-red",
  },
  watch: {
    icon: <TrendingUp className="size-4" />,
    ring: "border-signal-amber/45 bg-signal-amber/8",
    bar: "bg-signal-amber",
    text: "text-signal-amber",
  },
  celebrate: {
    icon: <Sparkles className="size-4" />,
    ring: "border-frich-yellow/45 bg-frich-yellow/8",
    bar: "bg-frich-yellow",
    text: "text-frich-yellow",
  },
  neutral: {
    icon: <Coffee className="size-4" />,
    ring: "border-border bg-card/70",
    bar: "bg-foreground/40",
    text: "text-foreground/80",
  },
};

const TONE_LABEL: Record<NocInsight["tone"], string> = {
  urgent: "Insight del momento",
  watch: "Mirá esto",
  celebrate: "Buena señal",
  neutral: "Lectura del día",
};

export function InsightStrip({ insight, className }: { insight: NocInsight; className?: string }) {
  const style = TONE_STYLE[insight.tone];
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border px-5 py-4",
        style.ring,
        className,
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", style.bar)} aria-hidden />
      <div className="flex items-start gap-3 pl-1">
        <span className={cn("mt-0.5 grid size-8 place-items-center rounded-lg border bg-background/40", style.text, "border-current/30")}>
          {style.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("text-[0.6rem] uppercase tracking-[0.22em]", style.text, "opacity-90")}>
            {TONE_LABEL[insight.tone]}
          </p>
          <p className="mt-1 text-base font-medium leading-snug text-foreground">{insight.headline}</p>
          {insight.detail ? (
            <p className="mt-1.5 text-sm text-muted-foreground">{insight.detail}</p>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
