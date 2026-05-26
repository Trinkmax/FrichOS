"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";

type Emp = { id: string; first_name: string; last_name: string; default_station_slug: string | null; location_id: string };
type Skill = { employee_id: string; station_slug: string; level: number };
type Loc = { id: string; slug: string; name: string; shortName: string };

const STATIONS = ["armado", "plancha", "freidora", "despacho"] as const;
const LEVEL_LABEL: Record<number, string> = { 1: "Aprendiz", 2: "Practicante", 3: "Operario", 4: "Maestro" };
const LEVEL_TONE: Record<number, string> = {
  1: "bg-frich-line text-muted-foreground",
  2: "bg-signal-amber/20 text-signal-amber",
  3: "bg-frich-yellow/20 text-frich-yellow",
  4: "bg-signal-green/20 text-signal-green",
};

export function SkillsMatrixView({ chainSlug: _chainSlug, employees, skills, locations }: { chainSlug: string; employees: Emp[]; skills: Skill[]; locations: Loc[] }) {
  const [activeLoc, setActiveLoc] = useState<string>(locations[0]?.id ?? "");
  const filtered = employees.filter((e) => e.location_id === activeLoc);

  const skillOf = (empId: string, st: string) => skills.find((s) => s.employee_id === empId && s.station_slug === st)?.level ?? 0;

  // Coverage check
  const coverage = STATIONS.map((st) => {
    const lvls = filtered.map((e) => skillOf(e.id, st)).filter((l) => l > 0);
    const max = Math.max(0, ...lvls);
    const count3plus = lvls.filter((l) => l >= 3).length;
    return { station: st, max, count3plus, gap: count3plus === 0 && filtered.length > 0 };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        ring="Anillo 2"
        title="Skills matrix"
        subtitle="Empleado × estación × nivel 1-4. El sistema valida que el mix de turno cubre la demanda esperada."
      />

      <section className="flex flex-wrap items-center gap-2">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Local</p>
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

      <section className="grid gap-3 md:grid-cols-4">
        {coverage.map((c) => (
          <Card key={c.station}>
            <CardContent className="p-4">
              <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground capitalize">{c.station}</p>
              <p className={cn("mt-1 font-mono text-2xl tabular", c.gap ? "text-signal-red" : "text-frich-yellow")}>{c.count3plus} n3+</p>
              <p className="font-mono text-[0.65rem] text-muted-foreground">máx nivel {c.max}</p>
              {c.gap ? <Badge tone="red" className="mt-2">Sin N3 — riesgo</Badge> : null}
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2">Empleado</th>
                  {STATIONS.map((st) => (
                    <th key={st} className="px-3 py-2 capitalize">{st}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((e, i) => (
                  <motion.tr key={e.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.02 }}>
                    <td className="px-4 py-2">
                      <span className="font-medium">{e.first_name} {e.last_name}</span>
                      <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                        def {e.default_station_slug ?? "—"}
                      </span>
                    </td>
                    {STATIONS.map((st) => {
                      const lvl = skillOf(e.id, st);
                      return (
                        <td key={st} className="px-3 py-2">
                          {lvl > 0 ? (
                            <span className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider", LEVEL_TONE[lvl])}>
                              N{lvl} · {LEVEL_LABEL[lvl]}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/70">—</span>
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
