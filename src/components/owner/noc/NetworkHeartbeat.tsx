"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

type HeartbeatPoint = {
  /** ISO minute bucket, e.g. "2026-05-25T13:34:00Z" */
  minute: string;
  /** orders placed in that minute, all locations */
  count: number;
};

type Props = {
  data: HeartbeatPoint[];
  className?: string;
  /** sliding window length to consider as "live" — anteriores se desvanecen */
  liveWindowMinutes?: number;
};

/**
 * Heartbeat de red — pulso de pedidos por minuto en los últimos N min.
 *
 * Diseño:
 * - Estilo ECG industrial: línea fina amarilla, fill suave, baseline punteada.
 * - El último minuto destaca con un dot que pulsa.
 * - Eje X implícito (cada step = 1 min). No rotular números de minuto: solo "vivo · 60min atrás".
 */
export function NetworkHeartbeat({ data, className, liveWindowMinutes = 60 }: Props) {
  const { path, areaPath, lastX, lastY, viewW, viewH, peakCount } = useMemo(() => {
    const w = 1000;
    const h = 80;
    const filtered = data.slice(-liveWindowMinutes);
    if (filtered.length < 2) {
      return { path: "", areaPath: "", lastX: 0, lastY: h / 2, viewW: w, viewH: h, peakCount: 0 };
    }
    const counts = filtered.map((d) => d.count);
    const max = Math.max(1, ...counts);
    const stepX = w / Math.max(1, filtered.length - 1);
    const pad = 6;
    const usable = h - pad * 2;

    const pts = filtered.map((d, i) => {
      const x = i * stepX;
      const y = pad + usable - (d.count / max) * usable;
      return { x, y };
    });

    const line = pts
      .map((p, i) => (i === 0 ? `M${p.x.toFixed(2)},${p.y.toFixed(2)}` : `L${p.x.toFixed(2)},${p.y.toFixed(2)}`))
      .join(" ");
    const area = `${line} L${w.toFixed(2)},${h.toFixed(2)} L0,${h.toFixed(2)} Z`;
    const last = pts[pts.length - 1]!;
    return { path: line, areaPath: area, lastX: last.x, lastY: last.y, viewW: w, viewH: h, peakCount: max };
  }, [data, liveWindowMinutes]);

  const recentSum = useMemo(() => {
    const last5 = data.slice(-5);
    return last5.reduce((a, b) => a + b.count, 0);
  }, [data]);

  if (data.length < 2) {
    return (
      <div
        className={cn(
          "relative h-20 w-full rounded-lg border border-border/40 bg-card/50 px-3 py-2",
          className,
        )}
      >
        <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          Latido de red · esperando señal
        </p>
        <div className="mt-3 flex h-8 items-center gap-1">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1 rounded-full bg-frich-yellow/30"
              style={{ opacity: 0.2 + Math.sin(i / 3) * 0.15 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-frich-yellow/15 bg-gradient-to-r from-frich-yellow/[0.04] via-frich-yellow/[0.07] to-frich-yellow/[0.04] px-4 pt-3 pb-2",
        className,
      )}
    >
      <div className="flex items-end justify-between text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="relative inline-flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-frich-yellow opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-frich-yellow" />
          </span>
          Latido de red · pedidos / min
        </span>
        <span className="font-mono text-foreground/80 tabular">
          {recentSum} <span className="text-muted-foreground">en los últimos 5 min</span>
        </span>
      </div>

      <div className="mt-2 h-16 w-full">
        <svg
          viewBox={`0 0 ${viewW} ${viewH}`}
          className="h-full w-full text-frich-yellow"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="hb-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hb-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((r) => (
            <line
              key={r}
              x1={0}
              y1={viewH * r}
              x2={viewW}
              y2={viewH * r}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeDasharray="2 4"
              strokeWidth={0.4}
            />
          ))}

          <motion.path
            d={areaPath}
            fill="url(#hb-fill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke="url(#hb-line)"
            strokeWidth={1.4}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.circle
            cx={lastX}
            cy={lastY}
            r={5}
            fill="currentColor"
            opacity={0.15}
            animate={{ r: [4, 9, 4], opacity: [0.15, 0, 0.15] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <circle cx={lastX} cy={lastY} r={2.8} fill="currentColor" />
        </svg>
      </div>

      <div className="mt-1 flex justify-between text-[0.55rem] font-mono uppercase tracking-wider text-muted-foreground/70 tabular">
        <span>−{liveWindowMinutes}min</span>
        <span>pico {peakCount}/min</span>
        <span>ahora</span>
      </div>
    </div>
  );
}
