/**
 * Insight engine — narrativa proactiva del día para el NOC.
 *
 * Rules-based, ranked by usefulness. Genera 1 línea principal + opcional 1 secundaria.
 * El owner debe poder leerla en <3 segundos y saber qué priorizar al abrir el sistema.
 */

import type { LocationAttention, LocationSignal } from "./network-health";

export type NocInsight = {
  tone: "celebrate" | "neutral" | "watch" | "urgent";
  headline: string;
  detail?: string;
  /** location_id si el insight apunta a un local específico — para hint visual */
  focusLocationId?: string;
};

type InsightInput = {
  signals: LocationSignal[];
  attention: LocationAttention[];
  locationNames: Record<string, string>;
};

type Candidate = NocInsight & { priority: number };

export function generateInsight(input: InsightInput): NocInsight {
  const { signals, attention, locationNames } = input;
  const candidates: Candidate[] = [];

  // 1. Andon rojo prolongado → urgente
  const oldestRedAndonLoc = signals
    .filter((s) => s.andonRed > 0 && s.oldestAndonAgeSec > 240)
    .sort((a, b) => b.oldestAndonAgeSec - a.oldestAndonAgeSec)[0];
  if (oldestRedAndonLoc) {
    candidates.push({
      priority: 100,
      tone: "urgent",
      headline: `Andon rojo sin resolver en ${locationNames[oldestRedAndonLoc.locationId] ?? "un local"} — ${Math.round(
        oldestRedAndonLoc.oldestAndonAgeSec / 60,
      )} min.`,
      detail: "Acción inmediata: contactá al encargado o bajate al local.",
      focusLocationId: oldestRedAndonLoc.locationId,
    });
  }

  // 2. Local con muchos SLA en rojo
  const slaProblem = signals
    .filter((s) => s.slaRed >= 3)
    .sort((a, b) => b.slaRed - a.slaRed)[0];
  if (slaProblem) {
    const peak = slaProblem.metrics.slice().sort((a, b) => b.utilization - a.utilization)[0];
    const peakHint = peak
      ? ` La restricción es ${peak.station} al ${Math.round(peak.utilization * 100)}%.`
      : "";
    candidates.push({
      priority: 88,
      tone: "urgent",
      headline: `${locationNames[slaProblem.locationId] ?? "Un local"} arrastra ${slaProblem.slaRed} pedidos en SLA rojo.${peakHint}`,
      detail: "Revisá si conviene admitir menos pedidos por 10 min hasta destrabar la cola.",
      focusLocationId: slaProblem.locationId,
    });
  }

  // 3. Restricción cross-location (misma estación saturada en >1 local)
  const stationPeaks = new Map<string, { count: number; locs: string[] }>();
  for (const s of signals) {
    const peak = s.metrics.find((m) => m.utilization >= 0.85);
    if (peak) {
      const e = stationPeaks.get(peak.station) ?? { count: 0, locs: [] };
      e.count += 1;
      e.locs.push(s.locationId);
      stationPeaks.set(peak.station, e);
    }
  }
  const crossPeak = Array.from(stationPeaks.entries()).find(([, v]) => v.count >= 2);
  if (crossPeak) {
    const [station, info] = crossPeak;
    candidates.push({
      priority: 70,
      tone: "watch",
      headline: `${station[0]?.toUpperCase()}${station.slice(1)} saturada en ${info.count} locales — patrón de red, no un local solo.`,
      detail: "Mirá si hay un mix de menú o demanda que esté apretando la misma estación en paralelo.",
    });
  }

  // 4. Throughput hoy vs ayer +X% en toda la red
  const today = signals.reduce((a, s) => a + s.throughputTodayCount, 0);
  const yesterday = signals.reduce((a, s) => a + s.throughputYesterdayCount, 0);
  if (yesterday >= 10 && today > yesterday) {
    const pct = Math.round(((today - yesterday) / yesterday) * 100);
    if (pct >= 15) {
      candidates.push({
        priority: 55,
        tone: "celebrate",
        headline: `Vas ${pct}% arriba del mismo momento de ayer. ${today} pedidos vs ${yesterday}.`,
        detail: "Si seguís este ritmo, hoy es buen día para preparar par levels altos del cierre.",
      });
    }
  }
  if (yesterday >= 10 && today < yesterday * 0.75) {
    const pct = Math.round((1 - today / yesterday) * 100);
    candidates.push({
      priority: 60,
      tone: "watch",
      headline: `Throughput ${pct}% abajo vs ayer (${today} vs ${yesterday}).`,
      detail: "Revisá si hay un canal caído (Rappi/PY/WA) antes de asumir demanda baja.",
    });
  }

  // 5. Revenue del día — celebrate o watch
  const revenueToday = signals.reduce((a, s) => a + s.revenueTodayCents, 0);
  const revenueYesterday = signals.reduce((a, s) => a + s.revenueYesterdayCents, 0);
  if (revenueYesterday > 0) {
    const delta = (revenueToday - revenueYesterday) / revenueYesterday;
    if (delta >= 0.2 && today >= yesterday) {
      candidates.push({
        priority: 50,
        tone: "celebrate",
        headline: `Revenue +${Math.round(delta * 100)}% vs ayer. ARS ${(revenueToday / 100_000).toFixed(0)}k hasta ahora.`,
      });
    }
  }

  // 6. NPS móvil 7d — alerta si bajó
  const npsValues = signals.map((s) => s.npsRolling7d).filter((v): v is number => v !== null);
  if (npsValues.length >= 2) {
    const meanNps = npsValues.reduce((a, b) => a + b, 0) / npsValues.length;
    if (meanNps < 20) {
      candidates.push({
        priority: 45,
        tone: "watch",
        headline: `NPS móvil 7d en ${Math.round(meanNps)}. La conversación con el cliente se está enfriando.`,
        detail: "Mirá Feedback bifurcado en Anillo 2 — el desbalance suele estar en un local específico.",
      });
    }
  }

  // 7. Líder de la red — quien tiene mejor signal
  const calmest = attention.slice().sort((a, b) => a.score - b.score)[0];
  const allCalm = attention.every((a) => a.band === "calm");
  if (allCalm) {
    candidates.push({
      priority: 20,
      tone: "celebrate",
      headline: "4 locales en banda. Red estable.",
      detail: "Aprovechá la calma para revisar Kaizen pendientes o experimentos en marcha.",
    });
  } else if (calmest && calmest.band === "calm") {
    candidates.push({
      priority: 10,
      tone: "neutral",
      headline: `${locationNames[calmest.locationId] ?? "Un local"} corriendo limpio. Buen benchmark del día.`,
    });
  }

  if (candidates.length === 0) {
    return {
      tone: "neutral",
      headline: "Sistema esperando datos. Abrí un local para empezar a captar señal.",
    };
  }

  candidates.sort((a, b) => b.priority - a.priority);
  const top = candidates[0]!;
  const { priority: _p, ...rest } = top;
  return rest;
}
