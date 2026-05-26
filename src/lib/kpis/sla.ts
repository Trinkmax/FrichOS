/**
 * SLA dinámico: estima el tiempo de salida en función de la cocina REAL del momento.
 * Acepta un ChainConfig para que cada cadena defina sus baselines.
 */

import { slaLevel, type SignalLevel } from "@/lib/design/tokens";
import type { ChainConfig } from "@/lib/chain/config";
import type { StationSlug } from "@/lib/types/db-enums";

export type ComplexityInput = {
  itemCount: number;
  modifierCount: number;
  /** Productos identificados como "heavy" (con station_steps de alto σ o ventana corta) */
  heavyItemFlags?: string[];
};

export function complexityScore(c: ComplexityInput): number {
  const base = c.itemCount * 1.0 + c.modifierCount * 0.25;
  const heavyPenalty = (c.heavyItemFlags ?? []).length * 0.6;
  return +(base + heavyPenalty).toFixed(2);
}

export type KitchenLoad = {
  etaToIdleByStation: Record<StationSlug, number>;
  queueDepthByStation: Record<StationSlug, number>;
};

export type DynamicSLA = {
  totalSeconds: number;
  breakdown: Record<StationSlug, number>;
  level: SignalLevel;
  promiseSeconds: number;
};

export function estimateDynamicSLA(
  complexity: number,
  load: KitchenLoad,
  config: ChainConfig,
): DynamicSLA {
  const base = config.stationBaselineSeconds;
  const breakdown: Record<StationSlug, number> = {
    armado: load.etaToIdleByStation.armado + base.armado * (1 + 0.08 * complexity),
    plancha: load.etaToIdleByStation.plancha + base.plancha * (1 + 0.06 * complexity),
    freidora: load.etaToIdleByStation.freidora + base.freidora * (1 + 0.04 * complexity),
    despacho: load.etaToIdleByStation.despacho + base.despacho * (1 + 0.05 * complexity),
  };

  const parallelMax = Math.max(breakdown.armado, breakdown.plancha, breakdown.freidora);
  const totalSeconds = Math.round(parallelMax + breakdown.despacho);

  const targetForLevel = config.sla.doorToDoorTargetMinutes * 60;
  const level = slaLevel(totalSeconds, targetForLevel);
  const promiseSeconds = Math.round(totalSeconds * config.sla.promisePaddingRatio);

  return { totalSeconds, breakdown, level, promiseSeconds };
}

export function customerFacingEtaMinutes(seconds: number): number {
  const m = seconds / 60;
  return Math.max(5, Math.round(m / 5) * 5);
}
