/**
 * Identificación dinámica de la restricción (Drum-Buffer-Rope).
 * Thresholds y buffers se reciben vía ChainConfig — no más hardcoded.
 */

import type { ChainConfig } from "@/lib/chain/config";
import type { StationSlug } from "@/lib/types/db-enums";
import { STATION_LABEL } from "@/lib/types/db-enums";

export type StationLiveMetrics = {
  station: StationSlug;
  queueDepth: number;
  utilization: number;
  etaToIdleSeconds: number;
};

export type BottleneckReading = {
  station: StationSlug;
  pressure: number;
  reason: string;
};

export function rankBottleneck(metrics: StationLiveMetrics[]): BottleneckReading[] {
  return metrics
    .map((m) => {
      const utilWeight = 0.5;
      const queueWeight = 0.3;
      const etaWeight = 0.2;
      const queueNorm = Math.min(1, m.queueDepth / 12);
      const etaNorm = Math.min(1, m.etaToIdleSeconds / 600);
      const pressure =
        utilWeight * m.utilization + queueWeight * queueNorm + etaWeight * etaNorm;
      const reasons: string[] = [];
      if (m.utilization > 0.85) reasons.push(`util ${(m.utilization * 100).toFixed(0)}%`);
      if (m.queueDepth >= 8) reasons.push(`cola ${m.queueDepth}`);
      if (m.etaToIdleSeconds > 480)
        reasons.push(`ocioso en ${Math.round(m.etaToIdleSeconds / 60)}min`);
      return {
        station: m.station,
        pressure: +pressure.toFixed(3),
        reason: reasons.join(" · ") || "dentro de banda",
      };
    })
    .sort((a, b) => b.pressure - a.pressure);
}

export function isBottleneck(reading: BottleneckReading): boolean {
  return reading.pressure >= 0.55;
}

export function bottleneckAdvice(top: BottleneckReading): string {
  if (!isBottleneck(top)) return "Cocina dentro de banda. Mantené el flujo.";
  const label = STATION_LABEL[top.station] ?? top.station;
  return `La restricción ahora es ${label}. ${top.reason}. No metas pedidos al horizonte de ${Math.max(
    4,
    Math.round(top.pressure * 12),
  )}min.`;
}

export function shouldActivateTurbo(
  metrics: StationLiveMetrics[],
  redPercentageOverall: number,
  config: ChainConfig,
): boolean {
  if (metrics.length === 0) return false;
  let criteria = 0;
  const top = metrics.reduce((best, m) => (m.utilization > best.utilization ? m : best));
  const t = config.turboThresholds;
  if (top.utilization > t.utilization) criteria += 1;
  if (top.queueDepth >= t.queueDepth) criteria += 1;
  if (top.etaToIdleSeconds > t.etaToIdleSec) criteria += 1;
  if (redPercentageOverall > t.redPct) criteria += 1;
  return criteria >= t.minCriteria;
}

/** Buffer DBR para una estación dada, según la config de la cadena. */
export function dbrBufferRange(station: StationSlug, config: ChainConfig): [number, number] {
  return config.dbrBufferSeconds[station] ?? [60, 120];
}
