"use client";

import { Fragment, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { KITCHEN_MODES, KITCHEN_MODE_LABEL, type KitchenMode } from "@/lib/types/db-enums";
import { setLocationMode } from "@/lib/actions/location-mode";

type LocationLite = {
  id: string;
  shortName: string;
  name: string;
  currentMode: KitchenMode;
};

type Props = {
  open: boolean;
  location: LocationLite | null;
  onOpenChange: (open: boolean) => void;
};

const MODE_HINT: Record<KitchenMode, string> = {
  normal: "Operación estándar. Todos los módulos activos.",
  turbo: "Buffer aumentado, ítems lentos desactivados, VIP routing activo. Activá en picos previsibles.",
  degraded: "Modo offline: KDS local + impresora térmica de respaldo. Solo activar si cayó la red.",
  opening: "Checklist obligatorio + validación de par levels iniciales.",
  closing: "Conciliación de inventario y reporte automático.",
};

const MODE_TONE: Record<KitchenMode, "yellow" | "amber" | "red" | "green" | "neutral"> = {
  normal: "neutral",
  turbo: "amber",
  degraded: "red",
  opening: "green",
  closing: "yellow",
};

export function QuickActionsDialog({ open, location, onOpenChange }: Props) {
  const [pending, startTransition] = useTransition();
  const [selectedMode, setSelectedMode] = useState<KitchenMode | null>(null);

  if (!location) return null;
  const current = location.currentMode;

  function handleSubmit(targetMode: KitchenMode) {
    if (!location) return;
    setSelectedMode(targetMode);
    startTransition(async () => {
      const res = await setLocationMode({ locationId: location.id, mode: targetMode });
      if (res.ok) {
        toast.success(`Modo ${KITCHEN_MODE_LABEL[res.newMode]}`, {
          description: `${location.shortName} pasó de ${KITCHEN_MODE_LABEL[res.previousMode]} a ${KITCHEN_MODE_LABEL[res.newMode]}.`,
        });
        onOpenChange(false);
      } else {
        toast.error("No se pudo cambiar el modo", { description: res.error });
      }
      setSelectedMode(null);
    });
  }

  return (
    <AnimatePresence>
      {open ? (
        <Fragment>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-frich-carbon/70 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Cambiar modo operativo de ${location.shortName}`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <header className="flex items-start justify-between border-b border-border/60 px-5 py-4">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">Modo operativo</p>
                <h2 className="mt-0.5 font-sans text-xl font-bold tracking-tight">{location.shortName}</h2>
                <p className="text-xs text-muted-foreground">{location.name}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="space-y-2 p-5">
              <p className="text-xs text-muted-foreground">
                El modo afecta admisión, buffers y prioridad de VIP. Tomá nota: el encargado del local recibe la notificación.
              </p>
              <div className="grid gap-2">
                {KITCHEN_MODES.map((mode) => {
                  const isCurrent = mode === current;
                  const tone = MODE_TONE[mode];
                  return (
                    <button
                      key={mode}
                      type="button"
                      disabled={pending}
                      onClick={() => handleSubmit(mode)}
                      className={cn(
                        "group relative flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition disabled:opacity-50",
                        isCurrent
                          ? "border-frich-yellow/60 bg-frich-yellow/8"
                          : "border-border hover:border-frich-yellow/40 hover:bg-frich-yellow/[0.03]",
                        selectedMode === mode && "ring-2 ring-frich-yellow",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-7 place-items-center rounded-lg",
                          tone === "amber" && "bg-signal-amber/15 text-signal-amber",
                          tone === "red" && "bg-signal-red/15 text-signal-red",
                          tone === "green" && "bg-signal-green/15 text-signal-green",
                          tone === "yellow" && "bg-frich-yellow/15 text-frich-yellow",
                          tone === "neutral" && "bg-muted/40 text-foreground/80",
                        )}
                      >
                        <Zap className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{KITCHEN_MODE_LABEL[mode]}</p>
                          {isCurrent ? (
                            <span className="rounded-full border border-frich-yellow/40 bg-frich-yellow/10 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.18em] text-frich-yellow">
                              actual
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{MODE_HINT[mode]}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <footer className="border-t border-border/60 bg-background/40 px-5 py-3">
              <p className="text-[0.7rem] text-muted-foreground">
                El cambio queda registrado en order_events con tu usuario. Reversible en cualquier momento.
              </p>
            </footer>
          </motion.div>
        </Fragment>
      ) : null}
    </AnimatePresence>
  );
}
