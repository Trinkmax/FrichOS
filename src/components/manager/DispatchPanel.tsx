"use client";

import { motion } from "motion/react";
import { Bike, Star, Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/design/motion";
import { formatPrice, formatSeconds } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type ReadyOrder = {
  id: string;
  order_code: string;
  channel: string;
  customer_name: string | null;
  total_cents: number;
  driver_eta_seconds: number | null;
  ready_at: string | null;
  locations: { short_name: string | null } | null;
};

type DispatchedOrder = {
  id: string;
  order_code: string;
  channel: string;
  customer_name: string | null;
  total_cents: number;
  dispatched_at: string | null;
  locations: { short_name: string | null } | null;
};

type Event = {
  id: string;
  event_type: string;
  driver_name: string | null;
  eta_seconds: number | null;
  created_at: string;
  locations: { short_name: string | null } | null;
};

export function DispatchPanel({ chainSlug: _chainSlug, ready, dispatched, events }: { chainSlug: string; ready: ReadyOrder[]; dispatched: DispatchedOrder[]; events: Event[] }) {
  return (
    <div className="space-y-6">
      <PageHeader
        ring="Anillo 1"
        title="Despacho sincronizado"
        subtitle="Inicio inverso del empaque cuando el driver está a 2-3 min. SLA medido puerta a puerta, no solo cocina. Score del repartidor por local."
      />

      <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardContent className="p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Listos para despacho ({ready.length})
            </p>
            <ul className="mt-3 space-y-2">
              {ready.length === 0 ? (
                <li className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                  Sin pedidos listos. Aparecen cuando las 4 estaciones completan.
                </li>
              ) : (
                ready.map((r, i) => {
                  const etaSec = r.driver_eta_seconds ?? null;
                  return (
                    <motion.li
                      key={r.id}
                      variants={fadeUp}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-signal-green/40 bg-signal-green/8 p-3 text-sm"
                    >
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{r.channel} · #{r.order_code}</p>
                        <p className="text-base">{r.customer_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{r.locations?.short_name}</p>
                      </div>
                      <div className="text-right">
                        {etaSec !== null ? (
                          <p className="font-mono text-sm text-signal-green">Driver en {formatSeconds(etaSec)}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Esperando driver</p>
                        )}
                        <p className="font-mono text-frich-yellow">{formatPrice(r.total_cents)}</p>
                      </div>
                    </motion.li>
                  );
                })
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Despachados recientes
            </p>
            <ul className="mt-3 space-y-1.5">
              {dispatched.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <Bike className="size-3.5 text-muted-foreground" />
                    <span className="truncate">{d.customer_name ?? "—"}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {d.dispatched_at ? new Date(d.dispatched_at).toLocaleTimeString("es-AR") : "—"}
                  </span>
                </li>
              ))}
              {dispatched.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
                  Cuando despaches el primer pedido aparece acá.
                </li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-frich-yellow">
            <Star className="size-4" />
            <p className="text-sm font-semibold">Score del repartidor por local</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Detecta patrones — un rappitero específico que siempre demora en un local. Cuando hay datos reales de Rappi/PY arriba, esta tabla se llena automáticamente.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {events.length === 0 ? (
              <li className="rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
                Sin eventos de driver aún. Adapter Rappi en modo mock.
              </li>
            ) : (
              events.slice(0, 10).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5">
                  <span className="inline-flex items-center gap-2">
                    <Truck className="size-3.5 text-muted-foreground" />
                    <Badge tone="outline" className="font-mono">{e.event_type}</Badge>
                    <span>{e.driver_name ?? "Driver"}</span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleTimeString("es-AR")}
                  </span>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
