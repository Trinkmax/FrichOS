"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Serie de valores; debe tener al menos 2 puntos */
  data: number[];
  className?: string;
  /** color de la línea — usar tokens (`text-signal-green`, `text-frich-yellow`, etc.) */
  stroke?: string;
  /** mostrar área debajo de la línea */
  fill?: boolean;
  /** dimensiones intrínsecas del viewBox; el SVG escala con CSS */
  viewW?: number;
  viewH?: number;
  /** baseline visual a 0 (útil para deltas %) */
  showBaseline?: boolean;
  /** punto final destacado */
  showEndDot?: boolean;
};

/**
 * Sparkline minimalista por SVG. Sin librerías: control total sobre estética.
 * El consumidor le aplica `text-{color}` y el path usa `currentColor`.
 */
export function Sparkline({
  data,
  className,
  stroke = "text-frich-yellow",
  fill = true,
  viewW = 120,
  viewH = 32,
  showBaseline = false,
  showEndDot = true,
}: Props) {
  const { path, areaPath, endX, endY, baselineY } = useMemo(() => {
    if (data.length < 2) {
      return { path: "", areaPath: "", endX: 0, endY: 0, baselineY: viewH / 2 };
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = viewW / (data.length - 1);
    const pad = 2;
    const usableH = viewH - pad * 2;

    const points = data.map((d, i) => {
      const x = i * stepX;
      const y = pad + usableH - ((d - min) / range) * usableH;
      return { x, y };
    });

    const line = points
      .map((p, i) => (i === 0 ? `M${p.x.toFixed(2)},${p.y.toFixed(2)}` : `L${p.x.toFixed(2)},${p.y.toFixed(2)}`))
      .join(" ");

    const area = `${line} L${viewW.toFixed(2)},${viewH.toFixed(2)} L0,${viewH.toFixed(2)} Z`;
    const last = points[points.length - 1]!;
    const zeroY = min < 0 && max > 0 ? pad + usableH - ((0 - min) / range) * usableH : viewH - pad;

    return { path: line, areaPath: area, endX: last.x, endY: last.y, baselineY: zeroY };
  }, [data, viewW, viewH]);

  if (data.length < 2) {
    return <div className={cn("h-8 w-full opacity-30", className)} aria-hidden />;
  }

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className={cn("h-full w-full", stroke, className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      {fill ? (
        <path d={areaPath} fill="currentColor" opacity={0.12} />
      ) : null}
      {showBaseline ? (
        <line
          x1={0}
          y1={baselineY}
          x2={viewW}
          y2={baselineY}
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeDasharray="2 3"
          strokeWidth={0.6}
        />
      ) : null}
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      {showEndDot ? (
        <circle cx={endX} cy={endY} r={2.4} fill="currentColor" />
      ) : null}
    </svg>
  );
}
