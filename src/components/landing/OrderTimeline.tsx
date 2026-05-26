"use client";

import { motion } from "motion/react";
import {
  ChefHat,
  Flame,
  HandPlatter,
  MessageCircle,
  Package,
  Smartphone,
  Star,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Step = {
  time: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
  highlight?: boolean;
};

export function OrderTimeline() {
  const steps: Step[] = [
    {
      time: "13:00",
      label: "WhatsApp confirma",
      detail: "Cliente pide. Orquestador asigna local, calcula SLA dinámico, manda confirmación con ETA real.",
      icon: <Smartphone className="size-4" />,
    },
    {
      time: "13:01",
      label: "Planificación inversa",
      detail: "Sistema calcula offsets hacia atrás desde 13:35: plancha 13:31, freidora 13:32, armado 13:34.",
      icon: <ChefHat className="size-4" />,
    },
    {
      time: "13:31",
      label: "Plancha arranca",
      detail: "KDS verde. Cliente recibe: tu burguer está en plancha.",
      icon: <Flame className="size-4" />,
      highlight: true,
    },
    {
      time: "13:35",
      label: "Convergencia",
      detail: "Armado, plancha y freidora terminan con desfase < 30s. Nada esperando enfriándose.",
      icon: <Package className="size-4" />,
    },
    {
      time: "13:36",
      label: "Driver llega",
      detail: "Despacho inicia empaque sincronizado con ETA del repartidor. Cliente recibe: tu pedido salió.",
      icon: <Truck className="size-4" />,
    },
    {
      time: "13:48",
      label: "Entregado",
      detail: "Puerta a puerta 48 min. Food cost, mano de obra y margen registrados por pedido.",
      icon: <HandPlatter className="size-4" />,
    },
    {
      time: "14:18",
      label: "Feedback bifurcado",
      detail: "5★ → Google Reviews. 3★ o menos → caso interno con causa raíz vinculada a estación, empleado y turno.",
      icon: <Star className="size-4" />,
    },
  ];

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-frich-yellow/30 via-border to-transparent md:left-1/2 md:-translate-x-1/2" />
      <ul className="space-y-6">
        {steps.map((s, i) => (
          <motion.li
            key={s.time}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "relative grid grid-cols-[44px_1fr] gap-4 md:grid-cols-2 md:gap-8",
              i % 2 === 1 && "md:[&>*:first-child]:order-2",
            )}
          >
            <div
              className={cn(
                "relative md:flex md:items-center",
                i % 2 === 0 ? "md:justify-end" : "md:justify-start",
              )}
            >
              <div
                className={cn(
                  "z-10 grid size-11 place-items-center rounded-full border-2 bg-card",
                  s.highlight
                    ? "border-frich-yellow text-frich-yellow-deep dark:text-frich-yellow shadow-[0_0_0_4px_rgba(252,211,59,0.15)]"
                    : "border-border text-muted-foreground",
                )}
              >
                {s.icon}
              </div>
            </div>
            <div
              className={cn(
                "rounded-2xl border-2 border-border bg-card p-4 md:max-w-md",
                i % 2 === 1 && "md:justify-self-end",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {s.time} · Córdoba
                </p>
              </div>
              <h4 className="mt-1 text-base font-bold tracking-tight">{s.label}</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
