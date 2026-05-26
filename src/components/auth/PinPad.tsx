"use client";

import { motion, AnimatePresence } from "motion/react";
import { Delete, X } from "lucide-react";
import { useState } from "react";
import { springs, fadeUp } from "@/lib/design/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  default_station_slug: string | null;
};

const STATIONS = [
  { slug: "armado", label: "Armado" },
  { slug: "plancha", label: "Plancha" },
  { slug: "freidora", label: "Freidora" },
  { slug: "despacho", label: "Despacho" },
];

export function PinPad({
  chainSlug,
  employees,
  presetStation,
  action,
  error,
}: {
  chainSlug: string;
  employees: Employee[];
  presetStation: string | null;
  action: (formData: FormData) => void;
  error: string | null;
}) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [stationSlug, setStationSlug] = useState<string>(presetStation ?? "");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const digit = (d: string) => {
    if (pin.length >= 4) return;
    setPin((p) => p + d);
  };
  const remove = () => setPin((p) => p.slice(0, -1));

  function onSubmit(form: HTMLFormElement) {
    if (!selectedEmployee || pin.length !== 4 || !stationSlug) return;
    setSubmitting(true);
    const fd = new FormData(form);
    fd.set("chainSlug", chainSlug);
    fd.set("employeeId", selectedEmployee.id);
    fd.set("pin", pin);
    fd.set("stationSlug", stationSlug);
    action(fd);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e.currentTarget);
      }}
      className="grid gap-8 lg:grid-cols-[1fr_400px]"
    >
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="space-y-6">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            1 · Elegí estación
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATIONS.map((s) => (
              <button
                type="button"
                key={s.slug}
                onClick={() => setStationSlug(s.slug)}
                className={cn(
                  "rounded-xl border px-4 py-4 text-left transition-all active:scale-[0.98]",
                  stationSlug === s.slug
                    ? "border-frich-yellow bg-frich-yellow/15 text-foreground frich-glow"
                    : "border-border bg-card/90 text-foreground/90 hover:border-frich-yellow/40",
                )}
              >
                <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                  estación
                </p>
                <p className="mt-1 font-sans font-bold text-xl tracking-tight">{s.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            2 · Tap tu cara
          </p>
          {employees.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No hay empleados sembrados aún. Cuando el seed corra aparecen acá.
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {employees.map((e) => {
                const active = selectedEmployee?.id === e.id;
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(e);
                        if (!stationSlug && e.default_station_slug) {
                          setStationSlug(e.default_station_slug);
                        }
                      }}
                      className={cn(
                        "flex w-full flex-col items-center gap-2 rounded-2xl border p-4 transition-all active:scale-[0.97]",
                        active
                          ? "border-frich-yellow bg-frich-yellow text-frich-carbon frich-glow"
                          : "border-border bg-card/90 hover:border-frich-yellow/40",
                      )}
                    >
                      <div
                        className={cn(
                          "grid size-16 place-items-center rounded-full text-2xl font-display brand-headline",
                          active ? "bg-frich-carbon text-frich-yellow" : "bg-secondary text-frich-yellow",
                        )}
                      >
                        {e.first_name[0]}
                        {e.last_name[0]}
                      </div>
                      <p className="font-bold leading-tight">{e.first_name}</p>
                      <p className={cn("text-[0.65rem] uppercase tracking-wider", active ? "text-frich-carbon/70" : "text-muted-foreground")}>
                        {e.last_name}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.05 }}
        className="rounded-3xl border border-border bg-card/95 p-6 lg:sticky lg:top-6"
      >
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">3 · Tu PIN</p>
        <AnimatePresence>
          {selectedEmployee && (
            <motion.div
              key={selectedEmployee.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: springs.snap }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 mb-4"
            >
              <p className="font-sans font-bold text-2xl tracking-tight text-frich-yellow">
                {selectedEmployee.first_name} {selectedEmployee.last_name}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="my-4 flex gap-3" data-tabular>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                borderColor: pin.length > i ? "#FCD33B" : "#26262C",
                scale: pin.length === i ? 1.04 : 1,
              }}
              transition={springs.snap}
              className="flex-1 rounded-xl border bg-background py-5 text-center font-mono text-3xl"
            >
              {pin[i] ? "●" : ""}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <PadKey key={n} onClick={() => digit(String(n))}>
              {n}
            </PadKey>
          ))}
          <PadKey onClick={() => setPin("")} variant="ghost">
            <X className="size-5" />
          </PadKey>
          <PadKey onClick={() => digit("0")}>0</PadKey>
          <PadKey onClick={remove} variant="ghost">
            <Delete className="size-5" />
          </PadKey>
        </div>

        {error ? (
          <p className="mt-4 rounded-md border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-sm text-signal-red">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="kds"
          className="mt-4 w-full"
          disabled={!selectedEmployee || pin.length !== 4 || !stationSlug || submitting}
        >
          {submitting ? "Entrando…" : "Entrar al KDS"}
        </Button>
      </motion.div>
    </form>
  );
}

function PadKey({
  children,
  onClick,
  variant = "solid",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "solid" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid h-16 place-items-center rounded-xl text-2xl font-semibold transition-all active:scale-[0.94]",
        variant === "solid"
          ? "bg-secondary text-foreground hover:bg-secondary"
          : "border border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
