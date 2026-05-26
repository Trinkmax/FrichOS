"use client";

import { useTransition } from "react";
import { motion } from "motion/react";
import { Beaker, BookOpenCheck, Lightbulb, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/design/motion";
import { generateKaizenHypotheses } from "@/lib/actions/kaizen";

type Hyp = {
  id: string;
  generated_at: string;
  title: string;
  hypothesis: string;
  suggested_action: string | null;
  success_metric: string | null;
  status: string;
};

type Exp = {
  id: string;
  phase: string;
  plan: unknown;
  do_notes: string | null;
  act_decision: string | null;
  created_at: string;
};

export function KaizenPanel({ chainSlug, hypotheses, experiments }: { chainSlug: string; hypotheses: Hyp[]; experiments: Exp[] }) {
  const [isPending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const res = await generateKaizenHypotheses({ chainSlug });
      if (!res.ok) toast.error(res.error);
      else toast.success(`Generé ${res.created} hipótesis nuevas`);
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        ring="Anillo 3"
        title="Motor Kaizen"
        subtitle="Cada semana, el sistema genera 3-5 hipótesis con experimento PDCA y métrica de éxito. Es un coach del próximo turno."
        right={
          <Button variant="primary" onClick={generate} disabled={isPending}>
            <Wand2 className="size-4" /> Generar hipótesis
          </Button>
        }
      />

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Hipótesis abiertas · prioridad
            </p>
            <ul className="mt-3 space-y-3">
              {hypotheses.length === 0 ? (
                <li className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                  Sin hipótesis aún. Tap "Generar hipótesis" para ejecutar el motor.
                </li>
              ) : (
                hypotheses.map((h, i) => (
                  <motion.li key={h.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.03 }} className="rounded-xl border border-border bg-background/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="size-4 text-frich-yellow" />
                        <p className="font-medium">{h.title}</p>
                      </div>
                      <Badge tone={h.status === "open" ? "yellow" : h.status === "accepted" ? "green" : "outline"}>{h.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-foreground/80">{h.hypothesis}</p>
                    {h.suggested_action ? (
                      <p className="mt-2 rounded-md border border-frich-yellow/30 bg-frich-yellow/8 px-2 py-1 text-xs">
                        <span className="font-mono uppercase tracking-wider text-frich-yellow/80">Acción · </span>
                        {h.suggested_action}
                      </p>
                    ) : null}
                    {h.success_metric ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-mono uppercase tracking-wider text-muted-foreground">Éxito · </span>
                        {h.success_metric}
                      </p>
                    ) : null}
                  </motion.li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-frich-yellow">
              <Beaker className="size-4" />
              <p className="text-sm font-semibold">Experimentos PDCA</p>
            </div>
            <ul className="mt-3 space-y-2">
              {experiments.length === 0 ? (
                <li className="rounded-xl border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
                  Cuando una hipótesis se acepta, arranca un ciclo PDCA.
                </li>
              ) : (
                experiments.map((e) => (
                  <li key={e.id} className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">PDCA</span>
                      <Badge tone={e.phase === "closed" ? "green" : "yellow"}>{e.phase}</Badge>
                    </div>
                    {e.act_decision ? <p className="mt-1 text-xs text-muted-foreground">{e.act_decision}</p> : null}
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
            <BookOpenCheck className="size-4" />
            <p className="text-sm font-semibold">Best-practice cross-pollination</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Cuando un local logra el mejor número en una métrica relevante, el sistema identifica qué hace distinto, genera una recomendación de replicación, y mide el impacto del trasplante para confirmar si la práctica fue causal o correlativa.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <Sparkles className="inline size-3" /> Disponible cuando haya datos comparables suficientes entre los 4 locales.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
