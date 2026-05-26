/** Basic descriptive stats for KDS metrics + SPC. */

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Cpk = min((USL − μ) / 3σ, (μ − LSL) / 3σ). Convention: one-sided USL only for station times. */
export function cpkUpperOnly(values: number[], usl: number): number | null {
  if (values.length < 30) return null;
  const m = mean(values);
  const s = stddev(values);
  if (s === 0) return null;
  return +((usl - m) / (3 * s)).toFixed(2);
}

/** SPC: % de muestras fuera de banda 3σ */
export function spcOutOfControlPct(values: number[], targetMean: number, target3Sigma: number) {
  if (values.length === 0) return 0;
  const usl = targetMean + target3Sigma;
  const lsl = Math.max(0, targetMean - target3Sigma);
  const outliers = values.filter((v) => v > usl || v < lsl).length;
  return +((outliers / values.length) * 100).toFixed(1);
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx]!;
}
