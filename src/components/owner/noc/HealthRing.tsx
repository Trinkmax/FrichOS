"use client";

import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect } from "react";
import { bandColor, bandLabel, type HealthBand, type NetworkHealth } from "@/lib/kpis/network-health";
import { cn } from "@/lib/utils/cn";

const RADIUS = 64;
const STROKE = 10;
const CIRC = 2 * Math.PI * RADIUS;

const TONE_HEX: Record<"green" | "amber" | "red", string> = {
  green: "#22C55E",
  amber: "#F59E0B",
  red: "#EF3E3E",
};

export function HealthRing({
  health,
  className,
}: {
  health: NetworkHealth;
  className?: string;
}) {
  const tone = bandColor(health.band);
  const ringColor = TONE_HEX[tone];

  const progress = useMotionValue(0);
  const dashOffset = useTransform(progress, (v) => CIRC * (1 - v / 100));
  const displayedScore = useTransform(progress, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(progress, health.score, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [progress, health.score]);

  return (
    <div className={cn("relative grid place-items-center", className)}>
      <svg
        width={(RADIUS + STROKE) * 2}
        height={(RADIUS + STROKE) * 2}
        viewBox={`0 0 ${(RADIUS + STROKE) * 2} ${(RADIUS + STROKE) * 2}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={STROKE}
          fill="none"
          className="text-foreground"
        />
        <motion.circle
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          stroke={ringColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRC}
          style={{ strokeDashoffset: dashOffset, filter: `drop-shadow(0 0 8px ${ringColor}60)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <motion.div className="font-mono text-5xl font-semibold tabular text-foreground">
            {displayedScore}
          </motion.div>
          <p className="mt-0.5 text-[0.55rem] uppercase tracking-[0.22em] text-muted-foreground">
            health · {bandLabel(health.band)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HealthBandPill({ band, className }: { band: HealthBand; className?: string }) {
  const tone = bandColor(band);
  const toneCls = {
    green: "border-signal-green/40 bg-signal-green/10 text-signal-green",
    amber: "border-signal-amber/45 bg-signal-amber/10 text-signal-amber",
    red: "border-signal-red/45 bg-signal-red/10 text-signal-red",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.18em]",
        toneCls,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone === "green" && "bg-signal-green", tone === "amber" && "bg-signal-amber", tone === "red" && "bg-signal-red")} />
      {bandLabel(band)}
    </span>
  );
}
