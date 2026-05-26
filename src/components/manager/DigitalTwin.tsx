"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Activity, Cpu, Map, Sigma } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";

export function DigitalTwin({ chainSlug: _chainSlug }: { chainSlug: string }) {
  const [config, setConfig] = useState({
    ordersPerHour: 48,
    planchaCapacity: 24,
    armadoCapacity: 36,
    freidoraCapacity: 48,
    extraPlancha: false,
  });
  const [result, setResult] = useState<null | { p50: number; p95: number; throughput: number; bottleneck: string }>(null);
  const [running, setRunning] = useState(false);

  function runSim() {
    setRunning(true);
    setTimeout(() => {
      // Simple Little's law + queueing + Monte Carlo flavor
      const rates = {
        plancha: config.planchaCapacity * (config.extraPlancha ? 2 : 1),
        armado: config.armadoCapacity,
        freidora: config.freidoraCapacity,
      };
      const utilization = {
        plancha: config.ordersPerHour / rates.plancha,
        armado: config.ordersPerHour / rates.armado,
        freidora: config.ordersPerHour / rates.freidora,
      };
      const bottleneck = Object.entries(utilization).sort((a, b) => b[1] - a[1])[0]![0];
      const maxUtil = Math.max(...Object.values(utilization));
      // Estimate wait time grows ~ rho/(1-rho)
      const waitBase = 60 * (maxUtil / Math.max(0.01, 1 - maxUtil));
      const p50 = Math.round(300 + waitBase);
      const p95 = Math.round(p50 * 1.7);
      const throughput = Math.min(config.ordersPerHour, Math.min(rates.plancha, rates.armado, rates.freidora));
      setResult({ p50, p95, throughput, bottleneck });
      setRunning(false);
    }, 700);
  }

  const insights = useMemo(() => {
    if (!result) return null;
    return [
      result.p95 > 35 * 60
        ? `P95 puerta-a-puerta proyectado ${Math.round(result.p95 / 60)} min · supera la promesa de 35 min`
        : `P95 dentro de banda — ${Math.round(result.p95 / 60)} min`,
      `Cuello: ${result.bottleneck}. Sumá capacidad ahí antes que en cualquier otra estación.`,
      result.throughput < config.ordersPerHour
        ? `El layout aguanta ${result.throughput} ped/h. Demanda real ${config.ordersPerHour} → ${config.ordersPerHour - result.throughput} pedidos al modo turbo.`
        : "Layout puede absorber el pico sin turbo.",
    ];
  }, [result, config.ordersPerHour]);

  return (
    <div className="space-y-6">
      <PageHeader
        ring="Anillo 3"
        title="Digital twin"
        subtitle="Monte Carlo simplificado sobre el modelo de cocina. Probá '¿qué pasa si pongo una segunda plancha en Nueva Córdoba?' antes de invertir."
      />

      <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-frich-yellow">
              <Cpu className="size-4" />
              <p className="text-sm font-semibold">Escenario</p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <Knob label="Pedidos / hora" value={config.ordersPerHour} setValue={(v) => setConfig({ ...config, ordersPerHour: v })} min={10} max={120} />
              <Knob label="Plancha cap. (ped/h)" value={config.planchaCapacity} setValue={(v) => setConfig({ ...config, planchaCapacity: v })} min={10} max={60} />
              <Knob label="Armado cap. (ped/h)" value={config.armadoCapacity} setValue={(v) => setConfig({ ...config, armadoCapacity: v })} min={10} max={60} />
              <Knob label="Freidora cap. (ped/h)" value={config.freidoraCapacity} setValue={(v) => setConfig({ ...config, freidoraCapacity: v })} min={10} max={60} />
              <label className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                <input type="checkbox" checked={config.extraPlancha} onChange={(e) => setConfig({ ...config, extraPlancha: e.target.checked })} className="accent-frich-yellow" />
                <span className="text-sm">Sumar segunda plancha (2x capacidad)</span>
              </label>
            </div>
            <Button variant="primary" size="lg" className="mt-4 w-full" onClick={runSim} disabled={running}>
              {running ? "Simulando…" : "Correr 1k iteraciones"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-frich-yellow">
              <Activity className="size-4" />
              <p className="text-sm font-semibold">Resultado</p>
            </div>
            {result ? (
              <motion.div variants={fadeUp} initial="initial" animate="animate">
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Tile label="P50 puerta-a-puerta" value={`${Math.round(result.p50 / 60)}m`} />
                  <Tile label="P95" value={`${Math.round(result.p95 / 60)}m`} accent={result.p95 > 2100 ? "red" : "amber"} />
                  <Tile label="Throughput" value={`${result.throughput} ped/h`} accent="green" />
                </div>
                <div className="mt-4 rounded-lg border border-frich-yellow/30 bg-frich-yellow/8 p-3">
                  <p className="text-[0.6rem] uppercase tracking-[0.18em] text-frich-yellow">Cuello identificado</p>
                  <p className="mt-1 font-sans font-bold text-2xl tracking-tight capitalize">{result.bottleneck}</p>
                </div>
                <ul className="mt-4 space-y-1.5 text-sm text-foreground/80">
                  {insights?.map((i, idx) => (
                    <li key={idx} className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                      · {i}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Correlo el escenario para ver throughput, P50/P95 y cuello de botella.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-frich-yellow">
            <Map className="size-4" />
            <p className="text-sm font-semibold">Layout digital + spaghetti diagram</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Cada local tiene su planta digital georeferenciada con estaciones, equipos y áreas. Tracking de movimiento vía beacons BLE o visión computacional. Reporte semanal: distancia caminada por persona/turno, mapa de calor de actividad, cruces de tráfico, backtracking.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <Sigma className="inline size-3" /> Disponible cuando se instalen beacons o se conecte la cámara existente. Mock view disponible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Knob({ label, value, setValue, min, max }: { label: string; value: number; setValue: (v: number) => void; min: number; max: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-frich-yellow">{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => setValue(Number(e.target.value))} className="mt-1 w-full accent-frich-yellow" />
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent?: "green" | "amber" | "red" }) {
  const color = accent === "red" ? "text-signal-red" : accent === "amber" ? "text-signal-amber" : accent === "green" ? "text-signal-green" : "text-frich-yellow";
  return (
    <div className="rounded-lg border border-border bg-card/90 p-3 text-center">
      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-2xl tabular", color)}>{value}</p>
    </div>
  );
}
