"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  Activity,
  Bike,
  Bot,
  ChefHat,
  Cpu,
  Flame,
  Gauge,
  Lightbulb,
  MessageSquareQuote,
  Package,
  Radio,
  ShieldAlert,
  Sparkles,
  Sigma,
  Users,
} from "lucide-react";
import { fadeUp } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";

type Tile = {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  ring: "1" | "2" | "3";
  span?: "wide" | "tall" | "normal";
  badge?: "live" | "beta" | "next";
};

export function ModuleBento({ chainSlug }: { chainSlug: string }) {
  const tiles: Tile[] = [
    {
      href: `/c/${chainSlug}/dashboard`,
      icon: <Flame className="size-5" />,
      title: "Operación · KDS multi-estación",
      body: "Mosaico en vivo con armado, plancha, freidora, despacho. Realtime sobre Postgres, semáforo SLA por pedido, restricción dinámica DBR.",
      ring: "1",
      span: "wide",
      badge: "live",
    },
    {
      href: `/c/${chainSlug}/dispatcher`,
      icon: <Radio className="size-5" />,
      title: "Orquestador omnicanal",
      body: "Punto único Rappi · PedidosYa · WhatsApp · salón.",
      ring: "1",
      badge: "live",
    },
    {
      href: `/c/${chainSlug}/andon`,
      icon: <ShieldAlert className="size-5" />,
      title: "Cable Andon",
      body: "Parar la línea + auto-escalación + Pareto 30d.",
      ring: "1",
      badge: "live",
    },
    {
      href: `/c/${chainSlug}/holds`,
      icon: <ChefHat className="size-5" />,
      title: "Quality holds",
      body: "Timer individual por unidad. HACCP forzado. FIFO.",
      ring: "1",
      badge: "live",
    },
    {
      href: `/c/${chainSlug}/noc`,
      icon: <Cpu className="size-5" />,
      title: "NOC virtual",
      body: "Los 4 locales en una pantalla. Lo que está en banda se desvanece.",
      ring: "2",
      span: "tall",
      badge: "live",
    },
    {
      href: `/c/${chainSlug}/metrics`,
      icon: <Sigma className="size-5" />,
      title: "Cpk · σ · SPC",
      body: "Control estadístico por estación-día. La consistencia escala.",
      ring: "2",
      badge: "live",
    },
    {
      href: `/c/${chainSlug}/financial`,
      icon: <Activity className="size-5" />,
      title: "Modelo financiero por pedido",
      body: "Food cost real, comisiones, COPQ, margen efectivo.",
      ring: "2",
      badge: "live",
    },
    {
      href: `/c/${chainSlug}/team`,
      icon: <Users className="size-5" />,
      title: "Skills matrix",
      body: "Empleado × estación × nivel 1-4. Detecta gaps de cobertura por turno.",
      ring: "2",
      badge: "live",
    },
    {
      href: `/c/${chainSlug}/feedback`,
      icon: <MessageSquareQuote className="size-5" />,
      title: "Feedback bifurcado",
      body: "5★ → Google. 3★− → caso interno con causa raíz.",
      ring: "2",
      badge: "live",
    },
    {
      href: `/c/${chainSlug}/kaizen`,
      icon: <Lightbulb className="size-5" />,
      title: "Motor Kaizen",
      body: "3-5 hipótesis semanales con experimento PDCA y métrica de éxito.",
      ring: "3",
      span: "wide",
      badge: "live",
    },
    {
      href: `/c/${chainSlug}/twin`,
      icon: <Gauge className="size-5" />,
      title: "Digital twin",
      body: "Monte Carlo: ¿2da plancha en Nueva Córdoba?",
      ring: "3",
      badge: "beta",
    },
    {
      href: `/c/${chainSlug}/inventory`,
      icon: <Package className="size-5" />,
      title: "Inventario + HACCP",
      body: "Par levels, 86 automático, lote-a-pedido.",
      ring: "1",
      badge: "beta",
    },
    {
      href: `/c/${chainSlug}/dispatch`,
      icon: <Bike className="size-5" />,
      title: "Despacho sincronizado",
      body: "Empaque inverso con ETA del repartidor.",
      ring: "1",
      badge: "beta",
    },
    {
      href: `#`,
      icon: <Bot className="size-5" />,
      title: "WhatsApp Cloud",
      body: "4 mensajes automáticos + feedback bifurcado por DM.",
      ring: "1",
      badge: "next",
    },
  ];

  const ringColor = {
    "1": "border-frich-yellow/60",
    "2": "border-blue-400/60",
    "3": "border-emerald-500/60",
  };

  const ringLabel = {
    "1": "Núcleo",
    "2": "Inteligencia",
    "3": "Mejora continua",
  };

  const ringTone = {
    "1": "text-frich-yellow-deep dark:text-frich-yellow",
    "2": "text-blue-700 dark:text-blue-300",
    "3": "text-emerald-700 dark:text-emerald-300",
  };

  const badge = {
    live: "bg-signal-green text-white",
    beta: "bg-frich-yellow text-frich-carbon",
    next: "bg-foreground/10 text-foreground/70",
  } as const;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {tiles.map((t, i) => (
        <motion.div
          key={t.title}
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.02 * i }}
          className={cn(
            t.span === "wide" && "md:col-span-2",
            t.span === "tall" && "md:row-span-2",
          )}
        >
          <Link
            href={t.href}
            className={cn(
              "group flex h-full flex-col rounded-2xl border-2 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl",
              ringColor[t.ring],
            )}
          >
            <div className="flex items-start justify-between">
              <span className={cn("grid size-10 place-items-center rounded-lg bg-foreground/5", ringTone[t.ring])}>
                {t.icon}
              </span>
              {t.badge ? (
                <span className={cn("rounded-full px-2 py-0.5 text-[0.55rem] font-mono uppercase tracking-wider", badge[t.badge])}>
                  {t.badge === "live" ? "en vivo" : t.badge === "beta" ? "beta" : "próximo"}
                </span>
              ) : null}
            </div>
            <p className={cn("mt-3 text-[0.55rem] uppercase tracking-[0.22em]", ringTone[t.ring])}>
              Anillo {t.ring} · {ringLabel[t.ring]}
            </p>
            <h3 className="mt-1 text-base font-bold tracking-tight">{t.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
            <span className="mt-auto pt-3 text-[0.7rem] font-mono uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
              → abrir
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
