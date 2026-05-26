"use client";

import { useMemo, useState } from "react";
import { Activity, Gauge, ScanLine, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { mean, stddev } from "@/lib/kpis/statistics";

type StationStat = {
  chain_id: string;
  location_id: string;
  station_slug: string;
  day: string;
  task_count: number;
  mean_seconds: number | null;
  sigma_seconds: number | null;
  cpk_estimate: number | null;
};

type Throughput = { hour: string; orders_count: number; revenue_cents: number; avg_door_to_door_sec: number | null };

type Loc = { id: string; slug: string; name: string; shortName: string };

type BaselineStep = { station_slug: string; target_seconds: number; sigma_seconds: number; confidence_level: string };

const STATIONS = ["armado", "plancha", "freidora", "despacho"] as const;

export function MetricsDashboard({
  chainSlug: _chainSlug,
  stationStats,
  throughput,
  locations,
  baselineSteps,
}: {
  chainSlug: string;
  stationStats: StationStat[];
  throughput: Throughput[];
  locations: Loc[];
  baselineSteps: BaselineStep[];
}) {
  const [activeLoc, setActiveLoc] = useState<string>(locations[0]?.id ?? "all");

  const baseline = useMemo(() => {
    return STATIONS.map((st) => {
      const items = baselineSteps.filter((b) => b.station_slug === st).map((b) => b.target_seconds);
      const sigmas = baselineSteps.filter((b) => b.station_slug === st).map((b) => b.sigma_seconds);
      return {
        station: st,
        targetMean: mean(items),
        targetMeanCount: items.length,
        sigmaBaseline: mean(sigmas),
        confidence: baselineSteps[0]?.confidence_level ?? "baseline_no_data",
      };
    });
  }, [baselineSteps]);

  const liveStats = useMemo(() => {
    const filtered = activeLoc === "all" ? stationStats : stationStats.filter((s) => s.location_id === activeLoc);
    return STATIONS.map((st) => {
      const items = filtered.filter((s) => s.station_slug === st && s.mean_seconds !== null);
      if (items.length === 0) {
        return { station: st, mean: null, sigma: null, cpk: null, observations: 0 };
      }
      const means = items.map((i) => Number(i.mean_seconds));
      const sigmas = items.map((i) => Number(i.sigma_seconds ?? 0));
      const cpks = items.map((i) => i.cpk_estimate).filter((v): v is number => v !== null);
      const totalObservations = items.reduce((a, s) => a + Number(s.task_count), 0);
      return {
        station: st,
        mean: mean(means),
        sigma: mean(sigmas),
        cpk: cpks.length > 0 ? mean(cpks) : null,
        observations: totalObservations,
      };
    });
  }, [stationStats, activeLoc]);

  return (
    <div className="space-y-6">
      <PageHeader
        ring="Anillo 2"
        title="Cpk · σ · SPC"
        subtitle="La consistencia es la métrica que escala, no el promedio. Cpk meta plancha/freidora ≥ 1.33, armado ≥ 1.20, despacho ≥ 1.50."
        right={<Badge tone="yellow">baseline v0 · sin calibrar</Badge>}
      />

      <section className="flex flex-wrap items-center gap-2">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Local</p>
        <button
          type="button"
          onClick={() => setActiveLoc("all")}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs",
            activeLoc === "all"
              ? "border-frich-yellow bg-frich-yellow text-frich-carbon font-semibold"
              : "border-border text-foreground/80 hover:border-frich-yellow/40",
          )}
        >
          Todos
        </button>
        {locations.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setActiveLoc(l.id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs",
              activeLoc === l.id
                ? "border-frich-yellow bg-frich-yellow text-frich-carbon font-semibold"
                : "border-border text-foreground/80 hover:border-frich-yellow/40",
            )}
          >
            {l.shortName}
          </button>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATIONS.map((st, idx) => {
          const live = liveStats[idx];
          const base = baseline[idx];
          if (!live || !base) return null;
          const tone =
            live.cpk === null
              ? "neutral"
              : live.cpk >= 1.33
                ? "green"
                : live.cpk >= 1.0
                  ? "amber"
                  : "red";
          return (
            <Card key={st}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="capitalize">{st}</span>
                  <Gauge className="size-4 text-muted-foreground" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <Stat label="μ live" value={live.mean !== null ? `${Math.round(live.mean)}s` : "—"} />
                  <Stat label="σ live" value={live.sigma !== null ? `${Math.round(live.sigma)}s` : "—"} />
                  <Stat label="Target μ" value={`${Math.round(base.targetMean)}s`} />
                  <Stat label="Target σ" value={`${Math.round(base.sigmaBaseline)}s`} />
                </div>
                <div
                  className={cn(
                    "mt-4 rounded-lg border p-2 text-center",
                    tone === "green" && "border-signal-green/40 bg-signal-green/8 text-signal-green",
                    tone === "amber" && "border-signal-amber/40 bg-signal-amber/8 text-signal-amber",
                    tone === "red" && "border-signal-red/40 bg-signal-red/8 text-signal-red",
                    tone === "neutral" && "border-border bg-muted/40 text-muted-foreground",
                  )}
                >
                  <p className="text-[0.6rem] uppercase tracking-[0.18em] opacity-80">Cpk estimado</p>
                  <p className="font-mono text-2xl tabular">{live.cpk !== null ? live.cpk.toFixed(2) : "—"}</p>
                </div>
                <p className="mt-2 font-mono text-[0.6rem] text-muted-foreground">
                  {live.observations} observaciones · {base.confidence}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-frich-yellow">
              <Activity className="size-4" />
              <p className="text-sm font-semibold">SPC — control estadístico</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Cuando la variabilidad de una estación sube fuera de control sin que el promedio cambie, también alerta — es la señal temprana de un problema crónico.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {liveStats.map((s) => (
                <li key={s.station} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-1.5">
                  <span className="capitalize">{s.station}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {s.observations >= 30 ? "SPC activo" : "warm-up — N<30"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-frich-yellow">
              <TrendingUp className="size-4" />
              <p className="text-sm font-semibold">Throughput hora a hora</p>
            </div>
            <ul className="mt-3 max-h-80 space-y-1.5 overflow-y-auto text-sm">
              {throughput.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
                  MV se refresca cada 5 min. Esperá tráfico real.
                </li>
              ) : (
                throughput.slice(0, 24).map((t) => (
                  <li key={t.hour} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-1.5">
                    <span className="font-mono text-xs">
                      {new Date(t.hour).toLocaleString("es-AR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                    </span>
                    <span className="font-mono">{t.orders_count}</span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-frich-yellow">
            <ScanLine className="size-4" />
            <p className="text-sm font-semibold">Modo calibración</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Hasta tener N≥200 obs por SKU, los semáforos del KDS pueden estar apagados — el sistema captura timestamps pero no presenta colores. Esto evita que falsos rojos/verdes desensibilicen al equipo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-base tabular">{value}</p>
    </div>
  );
}
