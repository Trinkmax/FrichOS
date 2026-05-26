/**
 * Operational signal tokens — match Tailwind config and globals.css.
 * Centralized so server-rendered SSR (where no className is enough)
 * and React state can both consume them.
 */

export type SignalLevel = "green" | "amber" | "red" | "neutral";

export const signalHex: Record<SignalLevel, string> = {
  green: "#22C55E",
  amber: "#F59E0B",
  red: "#EF3E3E",
  neutral: "#71717A",
};

export const signalLabel: Record<SignalLevel, string> = {
  green: "En banda",
  amber: "Cerca del límite",
  red: "Fuera de banda",
  neutral: "Sin dato",
};

export const signalClasses = {
  bg: {
    green: "bg-signal-green/15 text-signal-green",
    amber: "bg-signal-amber/15 text-signal-amber",
    red: "bg-signal-red/15 text-signal-red",
    neutral: "bg-signal-neutral/15 text-signal-neutral",
  },
  border: {
    green: "border-signal-green/40",
    amber: "border-signal-amber/50",
    red: "border-signal-red/60",
    neutral: "border-signal-neutral/30",
  },
  leftBar: {
    green: "before:bg-signal-green",
    amber: "before:bg-signal-amber",
    red: "before:bg-signal-red",
    neutral: "before:bg-signal-neutral",
  },
  glow: {
    green: "signal-glow-green",
    amber: "signal-glow-amber",
    red: "signal-glow-red",
    neutral: "",
  },
} as const;

export function slaLevel(
  elapsedSeconds: number,
  targetSeconds: number,
): SignalLevel {
  if (targetSeconds <= 0) return "neutral";
  const ratio = elapsedSeconds / targetSeconds;
  if (ratio < 0.8) return "green";
  if (ratio < 1.0) return "amber";
  return "red";
}

export const FRICH_YELLOW = "#FCD33B";
