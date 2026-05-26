import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ChannelSlug, StationSlug } from "@/lib/types/db-enums";

// ============================================================
// ChainConfig: tenant-scoped operational parameters.
// All numbers/colors/labels that historically lived in TS const
// objects now come from chains.settings (jsonb).
// Server Components hydrate this and pass it down.
// ============================================================

export type BrandSettings = {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
};

export type ChainConfig = {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  brand: BrandSettings;
  stationBaselineSeconds: Record<StationSlug, number>;
  stationBaselineSigma: Record<StationSlug, number>;
  dbrBufferSeconds: Record<StationSlug, [number, number]>;
  turboThresholds: {
    utilization: number;
    queueDepth: number;
    etaToIdleSec: number;
    redPct: number;
    minCriteria: number;
    minCooldownSec: number;
  };
  channelCommissionPct: Record<ChannelSlug, number>;
  sla: {
    promisePaddingRatio: number;
    doorToDoorTargetMinutes: number;
    convergenceWindowSeconds: number;
  };
  kpiTargets: {
    cpkPlanchaMin: number;
    cpkArmadoMin: number;
    cpkDespachoMin: number;
    sigmaCrossLocationMaxPct: number;
    redOrdersMaxPct: number;
    npsMin: number;
    foodCostMaxDeviationPp: number;
    copqMaxPct: number;
  };
  pinSessionTtlSeconds: number;
  calibrationModeMinObservations: number;
  foodCostDefaultPct: number;
};

const DEFAULTS = {
  stationBaselineSeconds: { armado: 100, plancha: 140, freidora: 160, despacho: 45 } as Record<StationSlug, number>,
  stationBaselineSigma: { armado: 18, plancha: 14, freidora: 12, despacho: 8 } as Record<StationSlug, number>,
  dbrBufferSeconds: {
    armado: [90, 150],
    plancha: [180, 240],
    freidora: [120, 180],
    despacho: [60, 90],
  } as Record<StationSlug, [number, number]>,
  turboThresholds: {
    utilization: 0.85,
    queueDepth: 8,
    etaToIdleSec: 600,
    redPct: 0.25,
    minCriteria: 2,
    minCooldownSec: 300,
  },
  channelCommissionPct: {
    rappi: 0.21,
    pedidosya: 0.22,
    whatsapp: 0,
    salon: 0,
    web: 0.04,
    kiosk: 0,
  } as Record<ChannelSlug, number>,
  sla: {
    promisePaddingRatio: 1.18,
    doorToDoorTargetMinutes: 35,
    convergenceWindowSeconds: 30,
  },
  kpiTargets: {
    cpkPlanchaMin: 1.33,
    cpkArmadoMin: 1.2,
    cpkDespachoMin: 1.5,
    sigmaCrossLocationMaxPct: 15,
    redOrdersMaxPct: 5,
    npsMin: 60,
    foodCostMaxDeviationPp: 1.5,
    copqMaxPct: 1.0,
  },
  pinSessionTtlSeconds: 43200,
  calibrationModeMinObservations: 200,
  foodCostDefaultPct: 0.32,
};

function readJson<T>(value: unknown, fallback: T): T {
  return (value && typeof value === "object" ? (value as T) : fallback);
}

export const getChainConfig = cache(async (slug: string): Promise<ChainConfig | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chains")
    .select("id, slug, name, timezone, currency, brand_color, logo_url, settings")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;

  const s = (data.settings ?? {}) as Record<string, unknown>;
  const brand = (s.brand ?? {}) as Record<string, unknown>;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    timezone: data.timezone ?? "America/Argentina/Cordoba",
    currency: data.currency ?? "ARS",
    brand: {
      name: (brand.name as string) ?? data.name,
      tagline: (brand.tagline as string) ?? null,
      logoUrl: (brand.logo_url as string) ?? data.logo_url ?? null,
      primaryColor: (brand.primary_color as string) ?? data.brand_color ?? "#FCD33B",
      secondaryColor: (brand.secondary_color as string) ?? "#0B0B0E",
    },
    stationBaselineSeconds: readJson(s.station_baseline_seconds, DEFAULTS.stationBaselineSeconds),
    stationBaselineSigma: readJson(s.station_baseline_sigma, DEFAULTS.stationBaselineSigma),
    dbrBufferSeconds: readJson(s.dbr_buffer_seconds, DEFAULTS.dbrBufferSeconds),
    turboThresholds: {
      ...DEFAULTS.turboThresholds,
      ...(readJson(s.turbo_thresholds, {}) as Record<string, number>),
      utilization: (readJson(s.turbo_thresholds, DEFAULTS.turboThresholds) as Record<string, number>).utilization ?? DEFAULTS.turboThresholds.utilization,
      queueDepth: (readJson(s.turbo_thresholds, DEFAULTS.turboThresholds) as Record<string, number>).queue_depth ?? DEFAULTS.turboThresholds.queueDepth,
      etaToIdleSec: (readJson(s.turbo_thresholds, DEFAULTS.turboThresholds) as Record<string, number>).eta_to_idle_sec ?? DEFAULTS.turboThresholds.etaToIdleSec,
      redPct: (readJson(s.turbo_thresholds, DEFAULTS.turboThresholds) as Record<string, number>).red_pct ?? DEFAULTS.turboThresholds.redPct,
      minCriteria: (readJson(s.turbo_thresholds, DEFAULTS.turboThresholds) as Record<string, number>).min_criteria ?? DEFAULTS.turboThresholds.minCriteria,
      minCooldownSec: (readJson(s.turbo_thresholds, DEFAULTS.turboThresholds) as Record<string, number>).min_cooldown_sec ?? DEFAULTS.turboThresholds.minCooldownSec,
    },
    channelCommissionPct: readJson(s.channel_commission_pct, DEFAULTS.channelCommissionPct),
    sla: {
      promisePaddingRatio: (readJson(s.sla, DEFAULTS.sla) as Record<string, number>).promise_padding_ratio ?? DEFAULTS.sla.promisePaddingRatio,
      doorToDoorTargetMinutes: (readJson(s.sla, DEFAULTS.sla) as Record<string, number>).door_to_door_target_minutes ?? DEFAULTS.sla.doorToDoorTargetMinutes,
      convergenceWindowSeconds: (readJson(s.sla, DEFAULTS.sla) as Record<string, number>).convergence_window_seconds ?? DEFAULTS.sla.convergenceWindowSeconds,
    },
    kpiTargets: {
      cpkPlanchaMin: (readJson(s.kpi_targets, DEFAULTS.kpiTargets) as Record<string, number>).cpk_plancha_min ?? DEFAULTS.kpiTargets.cpkPlanchaMin,
      cpkArmadoMin: (readJson(s.kpi_targets, DEFAULTS.kpiTargets) as Record<string, number>).cpk_armado_min ?? DEFAULTS.kpiTargets.cpkArmadoMin,
      cpkDespachoMin: (readJson(s.kpi_targets, DEFAULTS.kpiTargets) as Record<string, number>).cpk_despacho_min ?? DEFAULTS.kpiTargets.cpkDespachoMin,
      sigmaCrossLocationMaxPct: (readJson(s.kpi_targets, DEFAULTS.kpiTargets) as Record<string, number>).sigma_cross_location_max_pct ?? DEFAULTS.kpiTargets.sigmaCrossLocationMaxPct,
      redOrdersMaxPct: (readJson(s.kpi_targets, DEFAULTS.kpiTargets) as Record<string, number>).red_orders_max_pct ?? DEFAULTS.kpiTargets.redOrdersMaxPct,
      npsMin: (readJson(s.kpi_targets, DEFAULTS.kpiTargets) as Record<string, number>).nps_min ?? DEFAULTS.kpiTargets.npsMin,
      foodCostMaxDeviationPp: (readJson(s.kpi_targets, DEFAULTS.kpiTargets) as Record<string, number>).food_cost_max_deviation_pp ?? DEFAULTS.kpiTargets.foodCostMaxDeviationPp,
      copqMaxPct: (readJson(s.kpi_targets, DEFAULTS.kpiTargets) as Record<string, number>).copq_max_pct ?? DEFAULTS.kpiTargets.copqMaxPct,
    },
    pinSessionTtlSeconds: (s.pin_session_ttl_seconds as number) ?? DEFAULTS.pinSessionTtlSeconds,
    calibrationModeMinObservations:
      (s.calibration_mode_min_observations as number) ?? DEFAULTS.calibrationModeMinObservations,
    foodCostDefaultPct: (s.food_cost_default_pct as number) ?? DEFAULTS.foodCostDefaultPct,
  };
});

export async function requireChainConfig(slug: string): Promise<ChainConfig> {
  const cfg = await getChainConfig(slug);
  if (!cfg) throw new Error(`Chain "${slug}" not found`);
  return cfg;
}

// Client-safe shape (for prop drilling to client components). Same shape minus internal.
export type ChainConfigClient = ChainConfig;
