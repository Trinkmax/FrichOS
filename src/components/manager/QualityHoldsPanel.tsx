"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useTransition } from "react";
import { ChefHat, Plus, ThermometerSnowflake, Timer } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveTicker } from "@/components/motion/LiveTicker";
import { springs, fadeUp } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";
import { createHoldBatch, discardHoldBatch } from "@/lib/actions/holds";
import { formatSeconds } from "@/lib/utils/format";

type HoldKind = "patty_cooked" | "caramelized_onion" | "blanched_fries" | "toasted_bun" | "assembled_burger";

type HoldCategory = {
  id: string;
  kind: HoldKind;
  name: string;
  default_window_seconds: number;
  haccp_critical: boolean;
};

type Batch = {
  id: string;
  kind: HoldKind;
  qty_initial: number;
  qty_remaining: number;
  prepared_at: string;
  expires_at: string;
  status: string;
  location_id: string;
  locations: { short_name: string | null } | null;
};

type Loc = { id: string; slug: string; name: string; shortName: string };

export function QualityHoldsPanel({
  chainSlug: _chainSlug,
  categories,
  batches: initialBatches,
  locations,
}: {
  chainSlug: string;
  categories: HoldCategory[];
  batches: Batch[];
  locations: Loc[];
}) {
  const [batches, setBatches] = useState(initialBatches);
  const [selectedLoc, setSelectedLoc] = useState<string>(locations[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  function create(kind: HoldKind, qty: number) {
    if (!selectedLoc) return toast.error("Elegí local");
    startTransition(async () => {
      const res = await createHoldBatch({ locationId: selectedLoc, kind, qty });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Hold creado · timer arrancando");
        setBatches((b) => [res.batch as Batch, ...b]);
      }
    });
  }

  function discard(id: string) {
    startTransition(async () => {
      const res = await discardHoldBatch({ batchId: id });
      if (!res.ok) toast.error(res.error);
      else setBatches((b) => b.map((x) => (x.id === id ? { ...x, status: "discarded" } : x)));
    });
  }

  const active = batches.filter((b) => b.status === "active");

  return (
    <div className="space-y-6">
      <PageHeader
        ring="Anillo 1"
        title="Quality Holds calibrados"
        subtitle="Buffer pre-armable con timer individual por unidad. FIFO automático, descarte forzado y trazado HACCP."
        right={<Badge tone={active.length > 6 ? "red" : "yellow"}>{active.length} lotes activos</Badge>}
      />

      <section className="flex flex-wrap items-center gap-2">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Local</p>
        {locations.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setSelectedLoc(l.id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs",
              selectedLoc === l.id
                ? "border-frich-yellow bg-frich-yellow text-frich-carbon font-semibold"
                : "border-border text-foreground/80 hover:border-frich-yellow/40",
            )}
          >
            {l.shortName}
          </button>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {categories.map((c) => (
          <Card key={c.id} className="flex h-full flex-col">
            <CardContent className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-start gap-2 text-sm font-semibold leading-tight">
                  {c.haccp_critical ? (
                    <ThermometerSnowflake className="mt-0.5 size-4 shrink-0 text-signal-red" />
                  ) : (
                    <ChefHat className="mt-0.5 size-4 shrink-0 text-frich-yellow" />
                  )}
                  <span className="line-clamp-2 min-h-[2.5rem]">{c.name}</span>
                </span>
                {c.haccp_critical ? <Badge tone="red">HACCP</Badge> : null}
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Ventana {formatSeconds(c.default_window_seconds)}
              </p>
              <div className="mt-auto grid grid-cols-3 gap-2 pt-3">
                {[6, 12, 24].map((q) => (
                  <Button
                    key={q}
                    variant="secondary"
                    size="sm"
                    disabled={isPending || !selectedLoc}
                    onClick={() => create(c.kind, q)}
                    className="font-mono"
                  >
                    <Plus className="size-3.5" />
                    {q}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <p className="mb-3 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          Lotes activos · FIFO desc
        </p>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border/60">
              <AnimatePresence initial={false}>
                {active.length === 0 ? (
                  <motion.li
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                  >
                    Sin holds activos.
                  </motion.li>
                ) : (
                  active.map((b) => {
                    const remaining = Math.max(0, Math.floor((new Date(b.expires_at).getTime() - Date.now()) / 1000));
                    const total = Math.floor((new Date(b.expires_at).getTime() - new Date(b.prepared_at).getTime()) / 1000);
                    const danger = remaining < total * 0.2;
                    return (
                      <motion.li
                        key={b.id}
                        layout
                        variants={fadeUp}
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0, transition: springs.ambient }}
                        className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <Timer className={cn("size-4", danger ? "text-signal-red" : "text-muted-foreground")} />
                          <span className="font-mono text-xs uppercase tracking-wider">{b.kind}</span>
                          <span className="font-mono">{b.qty_remaining}/{b.qty_initial}</span>
                          <span className="text-xs text-muted-foreground">{b.locations?.short_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <LiveTicker
                            startedAt={b.prepared_at}
                            targetSeconds={total}
                            showSign
                            className={cn(
                              "font-mono text-sm",
                              danger ? "text-signal-red" : "text-signal-green",
                            )}
                          />
                          <Button variant="ghost" size="sm" onClick={() => discard(b.id)}>
                            Descartar
                          </Button>
                        </div>
                      </motion.li>
                    );
                  })
                )}
              </AnimatePresence>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
