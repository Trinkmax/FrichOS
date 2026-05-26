"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Hand, ShieldAlert, Siren, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { springs, fadeUp } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";
import { resolveAndon } from "@/lib/actions/andon";
import { createClient } from "@/lib/supabase/client";
import { formatSeconds } from "@/lib/utils/format";

type Cat = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  icon: string | null;
  escalate_manager_seconds: number;
  escalate_owner_seconds: number | null;
  stops_line: boolean;
};

type Pull = {
  id: string;
  state: string;
  triggered_at: string;
  station_slug: string | null;
  note: string | null;
  location_id?: string;
  root_cause?: string | null;
  resolved_at?: string | null;
  andon_categories: { name: string; color: string | null; slug?: string } | null;
  locations?: { short_name: string | null } | null;
};

type ParetoRow = {
  category_slug: string;
  category_name: string;
  pulls_30d: number;
  resolved_30d: number;
  avg_resolution_sec: number | null;
};

export function AndonPanel({
  chainSlug: _chainSlug,
  categories,
  open: initialOpen,
  recent,
  pareto,
}: {
  chainSlug: string;
  categories: Cat[];
  open: Pull[];
  recent: Pull[];
  pareto: ParetoRow[];
}) {
  const [open, setOpen] = useState<Pull[]>(initialOpen);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel("andon-panel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "andon_pulls" },
        async () => {
          const fresh = await fetch("/api/andon/open", { cache: "no-store" });
          if (fresh.ok) {
            const data = (await fresh.json()) as { open: Pull[] };
            setOpen(data.open);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  function resolveOne(id: string) {
    startTransition(async () => {
      const res = await resolveAndon({ andonId: id, rootCause: "Resuelto desde panel" });
      if (!res.ok) toast.error(res.error);
      else toast.success("Andon resuelto");
    });
  }

  const stopsLineCats = categories.filter((c) => c.stops_line);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Anillo 1</p>
          <h1 className="font-display brand-headline-lg text-4xl text-frich-yellow md:text-5xl">Andon expandido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cable Andon digital + auto-escalación + Pareto acumulado. Las quejas las ve la operación primero.
          </p>
        </div>
        <Badge tone={open.length > 0 ? "red" : "green"}>
          {open.length} {open.length === 1 ? "abierto" : "abiertos"}
        </Badge>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Eventos abiertos
            </p>
            <ul className="mt-3 space-y-2">
              <AnimatePresence initial={false}>
                {open.map((a) => (
                  <motion.li
                    key={a.id}
                    layout
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0, transition: springs.ambient }}
                    className={cn(
                      "rounded-xl border p-3",
                      a.andon_categories?.color === "red"
                        ? "border-signal-red/50 bg-signal-red/10"
                        : "border-signal-amber/40 bg-signal-amber/8",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Siren
                          className={cn(
                            "size-5",
                            a.andon_categories?.color === "red" ? "text-signal-red" : "text-signal-amber",
                          )}
                        />
                        <div>
                          <p className="font-medium">{a.andon_categories?.name ?? "Andon"}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {a.locations?.short_name ?? "—"} ·{" "}
                            {a.station_slug ? `Estación ${a.station_slug}` : "Local"} ·{" "}
                            {new Date(a.triggered_at).toLocaleTimeString("es-AR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={a.state === "escalated_owner" ? "red" : "amber"}>{a.state}</Badge>
                        <Button
                          variant="success"
                          size="sm"
                          disabled={isPending}
                          onClick={() => resolveOne(a.id)}
                        >
                          <CheckCircle2 className="size-4" /> Resolver
                        </Button>
                      </div>
                    </div>
                    {a.note ? <p className="mt-2 text-sm text-foreground/80">{a.note}</p> : null}
                  </motion.li>
                ))}
              </AnimatePresence>
              {open.length === 0 ? (
                <li className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                  Línea fluyendo. Sin incidentes abiertos.
                </li>
              ) : null}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Pareto (30 días)
              </p>
              <h3 className="font-sans font-bold text-xl tracking-tight">Causa raíz más rentable</h3>
              <ul className="mt-3 space-y-1.5">
                {pareto.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
                    Sin datos suficientes aún. Los pulls cierran después.
                  </li>
                ) : (
                  pareto.map((p) => (
                    <li
                      key={p.category_slug}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-sm"
                    >
                      <span className="truncate">{p.category_name}</span>
                      <span className="font-mono text-frich-yellow">{p.pulls_30d}</span>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Categorías que paran la línea
              </p>
              <ul className="mt-3 space-y-1.5">
                {stopsLineCats.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-signal-red/30 bg-signal-red/8 px-3 py-1.5 text-sm"
                  >
                    <span className="inline-flex items-center gap-2 text-signal-red">
                      <ShieldAlert className="size-4" />
                      {c.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      esc {formatSeconds(c.escalate_manager_seconds)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Card>
          <CardContent className="p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Historial reciente
            </p>
            <ul className="mt-3 divide-y divide-border/60">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Hand className="size-4 text-muted-foreground" />
                    <span>{r.andon_categories?.name ?? "Andon"}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {r.locations?.short_name ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(r.triggered_at).toLocaleString("es-AR")}</span>
                    <Badge tone={r.state === "resolved" ? "green" : r.state === "cancelled" ? "outline" : "amber"}>
                      {r.state}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <TrendingDown className="size-5 text-signal-amber" />
            <h3 className="mt-2 font-display text-lg">Próximos pasos</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>· Notificaciones push a encargado cuando se dispara Andon (Phase 2)</li>
              <li>· Integración con cámara fija para detectar accidentes (Phase 3)</li>
              <li>· Recuperar contexto: pedido, operario, hora exacta de pull (parcial)</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
