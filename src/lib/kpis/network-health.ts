/**
 * Network Health Score — vista del owner.
 *
 * Combina 4 dimensiones en un score 0–100 que responde una sola pregunta:
 * "¿Está sana mi red ahora mismo?"
 *
 * También expone attention scoring por location: qué local necesita
 * los ojos del dueño primero (triage).
 */

import type { StationLiveMetrics } from "@/lib/kpis/bottleneck";
import type { KitchenMode } from "@/lib/types/db-enums";

export type LocationSignal = {
  locationId: string;
  ordersInKitchen: number;
  slaRed: number;
  slaAmber: number;
  vipCount: number;
  andonOpen: number;
  andonRed: number;
  /** seconds since the oldest unresolved andon was triggered */
  oldestAndonAgeSec: number;
  currentMode: KitchenMode;
  metrics: StationLiveMetrics[];
  revenueTodayCents: number;
  revenueYesterdayCents: number;
  throughputTodayCount: number;
  throughputYesterdayCount: number;
  /** rolling NPS 7d, -100..100 (null if no responses) */
  npsRolling7d: number | null;
};

export type HealthBand = "excellent" | "good" | "watch" | "attention" | "critical";

export type NetworkHealth = {
  score: number;
  band: HealthBand;
  headline: string;
  components: {
    slaWeight: number;
    andonWeight: number;
    throughputWeight: number;
    npsWeight: number;
  };
};

export function bandFromScore(score: number): HealthBand {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 55) return "watch";
  if (score >= 35) return "attention";
  return "critical";
}

export function bandLabel(band: HealthBand): string {
  return {
    excellent: "Red al ritmo",
    good: "Red estable",
    watch: "Atención sutil",
    attention: "Hay que mirar",
    critical: "Acción inmediata",
  }[band];
}

export function bandColor(band: HealthBand): "green" | "amber" | "red" {
  if (band === "excellent" || band === "good") return "green";
  if (band === "watch" || band === "attention") return "amber";
  return "red";
}

const W_SLA = 40;
const W_ANDON = 25;
const W_THROUGHPUT = 20;
const W_NPS = 15;

export function computeNetworkHealth(signals: LocationSignal[]): NetworkHealth {
  if (signals.length === 0) {
    return {
      score: 100,
      band: "excellent",
      headline: "Sin locales activos",
      components: { slaWeight: W_SLA, andonWeight: W_ANDON, throughputWeight: W_THROUGHPUT, npsWeight: W_NPS },
    };
  }

  const totalOrders = signals.reduce((acc, s) => acc + s.ordersInKitchen, 0);
  const totalRed = signals.reduce((acc, s) => acc + s.slaRed, 0);
  const slaRedRatio = totalOrders === 0 ? 0 : totalRed / totalOrders;
  // 0% red → full points · 25%+ red → 0 points
  const slaScore = Math.max(0, W_SLA * (1 - slaRedRatio / 0.25));

  const totalAndon = signals.reduce((acc, s) => acc + s.andonOpen, 0);
  const totalAndonRed = signals.reduce((acc, s) => acc + s.andonRed, 0);
  // each red andon -6, each amber andon -2, capped at the bucket weight
  const andonPenalty = Math.min(W_ANDON, totalAndonRed * 6 + (totalAndon - totalAndonRed) * 2);
  const andonScore = W_ANDON - andonPenalty;

  const todayTotal = signals.reduce((acc, s) => acc + s.throughputTodayCount, 0);
  const yesterdayTotal = signals.reduce((acc, s) => acc + s.throughputYesterdayCount, 0);
  // Δ% vs ayer, mapeado a banda [-25%, +25%] → [0, W_THROUGHPUT]
  let throughputScore = W_THROUGHPUT / 2;
  if (yesterdayTotal > 0) {
    const delta = (todayTotal - yesterdayTotal) / yesterdayTotal;
    const clamped = Math.max(-0.25, Math.min(0.25, delta));
    throughputScore = W_THROUGHPUT * (0.5 + clamped * 2);
  }

  const npsValues = signals.map((s) => s.npsRolling7d).filter((v): v is number => v !== null);
  let npsScore = W_NPS / 2;
  if (npsValues.length > 0) {
    const meanNps = npsValues.reduce((a, b) => a + b, 0) / npsValues.length;
    // NPS -50 → 0, NPS 60+ → full
    const norm = Math.max(0, Math.min(1, (meanNps + 50) / 110));
    npsScore = W_NPS * norm;
  }

  const score = Math.round(slaScore + andonScore + throughputScore + npsScore);
  const band = bandFromScore(score);

  let headline = "Todo en banda. Mantené el ritmo.";
  if (band === "critical") headline = "La red te necesita ahora.";
  else if (band === "attention") headline = "Algo se está saliendo del eje.";
  else if (band === "watch") headline = "Mirá de reojo, todavía controlable.";
  else if (band === "good") headline = "Funcionando bien.";

  return {
    score,
    band,
    headline,
    components: {
      slaWeight: Math.round(slaScore),
      andonWeight: Math.round(andonScore),
      throughputWeight: Math.round(throughputScore),
      npsWeight: Math.round(npsScore),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export type LocationAttention = {
  locationId: string;
  score: number; // 0..100+
  band: "calm" | "watch" | "attend" | "urgent";
  primaryReason: string;
  secondaryReasons: string[];
};

/**
 * Attention score por local — informa el orden de las cards en el triage.
 * El número más alto reclama los ojos del dueño primero.
 */
export function computeLocationAttention(signal: LocationSignal): LocationAttention {
  const reasons: { text: string; weight: number }[] = [];

  if (signal.slaRed > 0) {
    reasons.push({
      text: `${signal.slaRed} pedido${signal.slaRed === 1 ? "" : "s"} en SLA rojo`,
      weight: signal.slaRed * 14,
    });
  }
  if (signal.andonRed > 0) {
    reasons.push({
      text: `${signal.andonRed} Andon rojo${signal.andonRed === 1 ? "" : "s"} abierto${signal.andonRed === 1 ? "" : "s"}`,
      weight: signal.andonRed * 22,
    });
  }
  const otherAndon = signal.andonOpen - signal.andonRed;
  if (otherAndon > 0) {
    reasons.push({
      text: `${otherAndon} Andon amarillo${otherAndon === 1 ? "" : "s"}`,
      weight: otherAndon * 8,
    });
  }
  if (signal.oldestAndonAgeSec > 300 && signal.andonOpen > 0) {
    reasons.push({
      text: `Andon más viejo ${Math.round(signal.oldestAndonAgeSec / 60)}m sin resolver`,
      weight: Math.min(20, Math.round(signal.oldestAndonAgeSec / 60)),
    });
  }
  const peakStation = signal.metrics
    .slice()
    .sort((a, b) => b.utilization - a.utilization)[0];
  if (peakStation && peakStation.utilization >= 0.85) {
    reasons.push({
      text: `${peakStation.station} al ${Math.round(peakStation.utilization * 100)}%`,
      weight: 18,
    });
  } else if (peakStation && peakStation.utilization >= 0.7) {
    reasons.push({
      text: `${peakStation.station} cerca del techo (${Math.round(peakStation.utilization * 100)}%)`,
      weight: 8,
    });
  }
  if (signal.currentMode === "degraded") {
    reasons.push({ text: "Modo degradado activo", weight: 30 });
  }
  if (signal.currentMode === "turbo") {
    reasons.push({ text: "Turbo activo — pico operativo", weight: 6 });
  }
  if (signal.slaAmber > 2) {
    reasons.push({
      text: `${signal.slaAmber} pedidos en SLA amarillo`,
      weight: Math.min(14, signal.slaAmber * 3),
    });
  }

  const score = reasons.reduce((acc, r) => acc + r.weight, 0);
  reasons.sort((a, b) => b.weight - a.weight);

  let band: LocationAttention["band"] = "calm";
  if (score >= 60) band = "urgent";
  else if (score >= 30) band = "attend";
  else if (score >= 10) band = "watch";

  return {
    locationId: signal.locationId,
    score,
    band,
    primaryReason: reasons[0]?.text ?? "Sin señales — local en banda",
    secondaryReasons: reasons.slice(1, 3).map((r) => r.text),
  };
}

export function attentionBandColor(band: LocationAttention["band"]): "green" | "amber" | "red" | "neutral" {
  switch (band) {
    case "urgent":
      return "red";
    case "attend":
      return "amber";
    case "watch":
      return "amber";
    case "calm":
      return "green";
  }
}

export function attentionBandLabel(band: LocationAttention["band"]): string {
  switch (band) {
    case "urgent":
      return "Atender ahora";
    case "attend":
      return "Necesita atención";
    case "watch":
      return "Mirar de reojo";
    case "calm":
      return "En banda";
  }
}
