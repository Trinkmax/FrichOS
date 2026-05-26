"use client";

import { motion } from "motion/react";
import { ExternalLink, MessageSquare, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";

type Response = {
  id: string;
  star_rating: number | null;
  category: string | null;
  free_text: string | null;
  routed_to_google: boolean;
  internal_case: boolean;
  responded_at: string;
  locations: { short_name: string | null } | null;
};

type NpsRow = { day: string; nps: number | null; avg_rating: number | null; responses: number };

export function FeedbackInbox({
  chainSlug: _chainSlug,
  responses,
  nps,
}: {
  chainSlug: string;
  responses: Response[];
  nps: NpsRow[];
}) {
  const fiveStar = responses.filter((r) => r.star_rating === 5).length;
  const lowStar = responses.filter((r) => (r.star_rating ?? 5) <= 3).length;
  const total = responses.length;
  const npsLatest = nps[0]?.nps ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        ring="Anillo 2"
        title="Feedback bifurcado"
        subtitle="5★ → Google Reviews. 3★ o menos → caso interno con causa raíz vinculada a estación, empleado y turno."
        right={<Badge tone="yellow">{total} respuestas</Badge>}
      />

      <section className="grid gap-3 md:grid-cols-4">
        <Card><CardContent className="p-5"><Stat label="NPS último" value={npsLatest !== null ? Math.round(npsLatest) : "—"} accent="yellow" /></CardContent></Card>
        <Card><CardContent className="p-5"><Stat label="5★ canalizadas" value={fiveStar} accent="green" /></CardContent></Card>
        <Card><CardContent className="p-5"><Stat label="Quejas internas" value={lowStar} accent={lowStar > 5 ? "red" : "amber"} /></CardContent></Card>
        <Card><CardContent className="p-5"><Stat label="Total recibidas" value={total} accent="yellow" /></CardContent></Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Inbox · más recientes
            </p>
            <ul className="mt-3 space-y-2">
              {responses.length === 0 ? (
                <li className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                  Sin feedback aún. Cada pedido entregado dispara una encuesta 30 min después.
                </li>
              ) : (
                responses.map((r) => (
                  <motion.li
                    key={r.id}
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    className={cn(
                      "rounded-xl border p-3",
                      (r.star_rating ?? 5) <= 3
                        ? "border-signal-red/40 bg-signal-red/8"
                        : (r.star_rating ?? 5) === 4
                          ? "border-signal-amber/40 bg-signal-amber/8"
                          : "border-signal-green/40 bg-signal-green/8",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRow value={r.star_rating ?? 0} />
                        <span className="text-xs text-muted-foreground">
                          {r.locations?.short_name ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {r.routed_to_google ? (
                          <Badge tone="green" className="gap-1"><ExternalLink className="size-3" /> Google</Badge>
                        ) : null}
                        {r.internal_case ? <Badge tone="red">Caso interno</Badge> : null}
                      </div>
                    </div>
                    {r.free_text ? (
                      <p className="mt-2 text-sm text-foreground/80">"{r.free_text}"</p>
                    ) : null}
                    {r.category ? (
                      <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                        {r.category}
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
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Tendencia NPS</p>
            <h3 className="font-sans font-bold text-xl tracking-tight">Promotores − Detractores</h3>
            <ul className="mt-3 space-y-1.5">
              {nps.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
                  El NPS aparece cuando hay respuestas suficientes.
                </li>
              ) : (
                nps.slice(0, 7).map((n) => (
                  <li key={n.day} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-sm">
                    <span className="font-mono text-xs">{new Date(n.day).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</span>
                    <span className="font-mono">{n.nps !== null ? Math.round(n.nps) : "—"}</span>
                    <span className="font-mono text-muted-foreground">n={n.responses}</span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </section>

      <p className="text-xs text-muted-foreground">
        <MessageSquare className="inline size-3 align-text-bottom" /> El loop automático WhatsApp arranca cuando la orden pasa a <span className="font-mono">delivered</span>.
      </p>
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < value ? "fill-frich-yellow text-frich-yellow" : "text-foreground/20",
          )}
        />
      ))}
    </span>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: "yellow" | "green" | "amber" | "red" }) {
  const color = { yellow: "text-frich-yellow", green: "text-signal-green", amber: "text-signal-amber", red: "text-signal-red" }[accent];
  return (
    <>
      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-3xl tabular", color)}>{value}</p>
    </>
  );
}
