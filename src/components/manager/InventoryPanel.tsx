"use client";

import { motion } from "motion/react";
import { AlertTriangle, Package, ShieldCheck, Thermometer } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";

type Item = { id: string; slug: string; name: string; unit: string; allergens: string[] };
type Temp = { id: string; device_label: string; device_type: string; temperature_c: number; is_alert: boolean; recorded_at: string; locations: { short_name: string | null } | null };

export function InventoryPanel({ chainSlug: _chainSlug, items, temps }: { chainSlug: string; items: Item[]; temps: Temp[] }) {
  const alerts = temps.filter((t) => t.is_alert);
  return (
    <div className="space-y-6">
      <PageHeader
        ring="Anillo 1"
        title="Inventario + HACCP"
        subtitle="Par levels por estación al inicio del turno. Descuento automático por cada pedido despachado. 86 automático en Rappi/PY. Temperatura continua vía IoT. FIFO digital por lote."
        right={alerts.length > 0 ? <Badge tone="red">{alerts.length} alertas T°</Badge> : <Badge tone="green">HACCP OK</Badge>}
      />

      <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-frich-yellow">
              <Package className="size-4" />
              <p className="text-sm font-semibold">Catálogo de insumos</p>
            </div>
            {items.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                Cuando cargues insumos, aparecen acá con par levels. La integración del 86 a Rappi/PY se dispara automática.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5 text-sm">
                {items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5">
                    <span>{i.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {i.allergens?.map((a) => (
                        <Badge key={a} tone="outline" className="font-mono text-[0.55rem]">{a}</Badge>
                      ))}
                      <span className="font-mono">{i.unit}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-frich-yellow">
              <Thermometer className="size-4" />
              <p className="text-sm font-semibold">Lecturas T° (IoT)</p>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {temps.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
                  Sin sensores aún. Cuando conectes IoT (USD 30 c/u), las lecturas llegan acá cada 30s.
                </li>
              ) : (
                temps.map((t) => (
                  <motion.li
                    key={t.id}
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-1.5",
                      t.is_alert ? "border-signal-red/40 bg-signal-red/8" : "border-border/60 bg-background/70",
                    )}
                  >
                    <span>
                      {t.device_label}
                      <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">{t.device_type}</span>
                    </span>
                    <span className={cn("font-mono", t.is_alert ? "text-signal-red" : "text-signal-green")}>{t.temperature_c}°C</span>
                  </motion.li>
                ))
              )}
            </ul>
            <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-3" /> HACCP zona peligro 4-60°C
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-frich-yellow">
            <AlertTriangle className="size-4" />
            <p className="text-sm font-semibold">Trazabilidad lote-a-pedido</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Ante un retiro de proveedor, el sistema indica exactamente qué pedidos contenían ese lote. Esquema preparado (tabla <code>lots</code> + <code>inventory_transactions.lot_id</code>); falta capturar lot al recibir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
