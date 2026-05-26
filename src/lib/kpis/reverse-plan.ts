/**
 * Planificación inversa (Pull desde despacho).
 *
 * Dada una hora deseada de salida T_out y los station-steps de cada item,
 * calculamos un start_target_at por (item × estación) para que los
 * componentes converjan en despacho con desfase < 30s.
 *
 * Reglas:
 * - Cada step tiene `target_seconds` (μ) y `sigma_seconds` (σ).
 * - Si una estación reporta atraso > 1σ → re-plan; < 1σ → no reaccionar.
 * - Ventana de calidad del componente NO debe vencerse antes del dispatch.
 * - Si componente A tiene window=600s y plancha = 120s, entonces start_target_at(A)
 *   no debe ser anterior a dispatch_at − (120 + 600).
 *
 * Hasta tener tiempos calibrados (N>=200 obs/SKU), el flag `calibration_mode`
 * deshabilita semáforos pero conserva la planificación informativa.
 */

export type StationStep = {
  station: "armado" | "plancha" | "freidora" | "despacho";
  /** Tiempo objetivo en segundos (μ) */
  target_seconds: number;
  /** σ esperado */
  sigma_seconds: number;
  /** Ventana de calidad post-finalización (segundos). null = no aplica */
  quality_window_seconds: number | null;
  /** Orden dentro de la estación (1 = primer paso). Para steps secuenciales en misma estación. */
  sequence: number;
};

export type ItemPlanInput = {
  itemId: string;
  productName: string;
  steps: StationStep[];
};

export type PlannedTask = {
  itemId: string;
  station: StationStep["station"];
  /** UTC timestamp en ms */
  start_target_at: number;
  /** UTC ms */
  finish_target_at: number;
  /** Hora máxima a la que puede terminar sin violar ventana de calidad */
  quality_deadline_at: number | null;
  sequence: number;
};

export type ReversePlanOutput = {
  dispatch_target_at: number;
  tasks: PlannedTask[];
  /** Holguras por estación: ms de slack — si <0, este pedido excede capacidad temporal */
  slack_ms_by_station: Record<StationStep["station"], number>;
};

export const DISPATCH_CONVERGENCE_WINDOW_SECONDS = 30;

export function reversePlan(
  items: ItemPlanInput[],
  dispatch_target_at_ms: number,
  now_ms: number = Date.now(),
): ReversePlanOutput {
  const tasks: PlannedTask[] = [];
  const slack: Record<StationStep["station"], number> = {
    armado: Infinity,
    plancha: Infinity,
    freidora: Infinity,
    despacho: Infinity,
  };

  for (const item of items) {
    const stepsByStation = new Map<StationStep["station"], StationStep[]>();
    for (const s of item.steps) {
      if (!stepsByStation.has(s.station)) stepsByStation.set(s.station, []);
      stepsByStation.get(s.station)!.push(s);
    }
    for (const [, list] of stepsByStation) {
      list.sort((a, b) => a.sequence - b.sequence);
    }

    for (const [station, list] of stepsByStation) {
      // Total seconds across all sequenced steps in this station for this item
      const totalSeconds = list.reduce((acc, s) => acc + s.target_seconds, 0);

      // The last step in this station should finish ≤ dispatch_target with a small lead
      const leadSeconds =
        station === "despacho" ? 0 : DISPATCH_CONVERGENCE_WINDOW_SECONDS / 2;
      const finish_target_at = dispatch_target_at_ms - leadSeconds * 1000;
      const start_target_at = finish_target_at - totalSeconds * 1000;

      // Quality deadline: latest end of any step with a window
      const lastWindow = list[list.length - 1]?.quality_window_seconds ?? null;
      const quality_deadline_at =
        lastWindow !== null ? finish_target_at + lastWindow * 1000 : null;

      tasks.push({
        itemId: item.itemId,
        station,
        start_target_at,
        finish_target_at,
        quality_deadline_at,
        sequence: list[0]?.sequence ?? 1,
      });

      const ms_until_start = start_target_at - now_ms;
      slack[station] = Math.min(slack[station], ms_until_start);
    }
  }

  return { dispatch_target_at: dispatch_target_at_ms, tasks, slack_ms_by_station: slack };
}

export function shouldReplan(
  reported_lag_seconds: number,
  step_sigma_seconds: number,
): boolean {
  return reported_lag_seconds > step_sigma_seconds;
}
