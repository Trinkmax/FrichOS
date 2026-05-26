import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, KeyRound, Mail, Sparkles } from "lucide-react";
import { ChainLogo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireChainConfig } from "@/lib/chain/config";
import { BrandProvider } from "@/lib/chain/brand-context";
import { STATIONS, STATION_LABEL, type StationSlug } from "@/lib/types/db-enums";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

const STATION_BLURB: Record<StationSlug, string> = {
  armado: "Mise en place, agregados, modificaciones, secuencia final antes del despacho.",
  plancha: "Medallones, panceta, panes en tostadora vertical.",
  freidora: "Papas, aros, nuggets, pollo crispy.",
  despacho: "Empaque sincronizado con la llegada del repartidor.",
};

export default async function KdsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ chainSlug: string }>;
  searchParams: Promise<{ loc?: string }>;
}) {
  const { chainSlug } = await params;
  const { loc } = await searchParams;
  const config = await requireChainConfig(chainSlug);
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("locations")
    .select("id, slug, name, short_name, has_dining_area")
    .eq("chain_id", config.id)
    .eq("is_active", true)
    .order("name");

  const activeLoc =
    (locations ?? []).find((l) => l.slug === loc) ?? (locations ?? [])[0];
  if (!activeLoc) redirect(`/c/${chainSlug}/dashboard`);

  const { data: metrics } = await supabase
    .from("v_station_live_metrics")
    .select("station_slug, queue_depth, utilization, eta_to_idle_sec")
    .eq("location_id", activeLoc.id);

  const metricsByStation = new Map<
    StationSlug,
    { queue_depth: number; utilization: number; eta_to_idle_sec: number }
  >();
  for (const m of metrics ?? []) {
    metricsByStation.set(m.station_slug as StationSlug, {
      queue_depth: m.queue_depth ?? 0,
      utilization: Number(m.utilization ?? 0),
      eta_to_idle_sec: m.eta_to_idle_sec ?? 0,
    });
  }

  return (
    <BrandProvider value={config.brand}>
      <main
        data-surface="kds"
        data-kiosk="true"
        className="relative min-h-screen overflow-hidden"
      >
        <header className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
          <Link href={`/c/${chainSlug}`}>
            <ChainLogo height={48} priority />
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href={`/c/${chainSlug}/login`}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 uppercase tracking-wider text-foreground/80 transition hover:border-frich-yellow"
            >
              <Mail className="size-3.5" /> Gerencia
            </Link>
            <Link
              href={`/c/${chainSlug}/pin`}
              className="inline-flex items-center gap-2 rounded-lg border border-frich-yellow bg-frich-yellow px-3 py-2 font-semibold uppercase tracking-wider text-frich-carbon transition hover:bg-frich-yellow-hot"
            >
              <KeyRound className="size-3.5" /> Iniciar turno con PIN
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-8 pb-12">
          <div className="mb-2 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="size-3.5 text-frich-yellow" />
            KDS · Kitchen Display System
          </div>
          <h1 className="font-display brand-headline-lg text-4xl text-frich-yellow md:text-5xl">
            Elegí estación
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Cada estación tiene su propio KDS con cola priorizada, semáforo SLA, Andon y timer
            individual por unidad. Tap una para abrir su consola dedicada — vas a necesitar
            ingresar con PIN.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <p className="self-center text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Local
            </p>
            {(locations ?? []).map((l) => (
              <Link
                key={l.id}
                href={`/c/${chainSlug}/kds?loc=${l.slug}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition",
                  l.id === activeLoc.id
                    ? "border-frich-yellow bg-frich-yellow text-frich-carbon font-semibold"
                    : "border-border bg-card text-foreground/80 hover:border-frich-yellow/40",
                )}
              >
                {l.short_name ?? l.name}
                {!l.has_dining_area ? (
                  <span className="font-mono text-[0.55rem] uppercase tracking-wider opacity-70">delivery</span>
                ) : null}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {STATIONS.map((s) => {
              const m = metricsByStation.get(s);
              const util = m?.utilization ?? 0;
              const queue = m?.queue_depth ?? 0;
              const level = util > 0.85 ? "red" : util > 0.65 ? "amber" : "green";
              const accentBorder =
                level === "red"
                  ? "border-signal-red"
                  : level === "amber"
                    ? "border-signal-amber"
                    : "border-frich-yellow";
              const accentText =
                level === "red"
                  ? "text-signal-red"
                  : level === "amber"
                    ? "text-signal-amber"
                    : "text-signal-green";
              return (
                <Link
                  key={s}
                  href={`/c/${chainSlug}/pin?station=${s}`}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border-2 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg",
                    accentBorder,
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Estación
                      </p>
                      <h2 className="font-sans font-bold text-3xl tracking-tight capitalize">
                        {STATION_LABEL[s]}
                      </h2>
                      <p className="mt-2 max-w-sm text-sm text-foreground/80">
                        {STATION_BLURB[s]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Utilización
                      </p>
                      <p className={cn("font-mono text-3xl font-bold tabular", accentText)}>
                        {Math.round(util * 100)}%
                      </p>
                      <p className="mt-1 font-mono text-[0.7rem] text-muted-foreground">
                        cola {queue}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-xs">
                    <Badge tone={level === "red" ? "red" : level === "amber" ? "amber" : "green"}>
                      {level === "red"
                        ? "Restricción"
                        : level === "amber"
                          ? "Cerca del límite"
                          : "En banda"}
                    </Badge>
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground/80 group-hover:text-foreground">
                      Abrir KDS <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 rounded-xl border border-dashed border-border bg-card/70 p-4 text-xs text-muted-foreground">
            <p>
              ¿Vas a probar el flujo completo? Demo PIN: el primer empleado de cada local usa <span className="font-mono text-foreground">1234</span>.
              Después del PIN, entrás directo al KDS de la estación elegida con realtime activo.
            </p>
          </div>
        </section>
      </main>
    </BrandProvider>
  );
}
