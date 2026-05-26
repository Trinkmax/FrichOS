"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Flame, ShoppingBag, Star, Users } from "lucide-react";
import { fadeUp } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";

export type LiveStat = {
  key: "locations" | "in_kitchen" | "team" | "products";
  label: string;
  value: number;
  unit?: string;
  accent?: "yellow" | "green" | "amber" | "neutral";
  realtime?: boolean;
};

const ICON: Record<LiveStat["key"], React.ReactNode> = {
  locations: <Flame className="size-5" />,
  in_kitchen: <ShoppingBag className="size-5" />,
  team: <Users className="size-5" />,
  products: <Star className="size-5" />,
};

export function LiveStats({ stats }: { stats: LiveStat[] }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s, i) => {
        const accent = s.accent ?? "yellow";
        const accentCls = {
          yellow: "text-frich-yellow",
          green: "text-signal-green",
          amber: "text-signal-amber",
          neutral: "text-foreground",
        }[accent];
        return (
          <motion.div
            key={s.key}
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.05 * i }}
            className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-frich-yellow/60 hover:shadow-lg"
          >
            {s.realtime ? (
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 text-[0.55rem] uppercase tracking-[0.18em] text-signal-green">
                <span
                  className={cn(
                    "size-1.5 rounded-full bg-signal-green",
                    tick % 2 === 0 ? "opacity-100" : "opacity-30",
                  )}
                />
                live
              </span>
            ) : null}
            <span
              className={cn(
                "grid size-9 place-items-center rounded-lg bg-foreground/5",
                accentCls,
              )}
            >
              {ICON[s.key]}
            </span>
            <p className="mt-4 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              {s.label}
            </p>
            <p className={cn("mt-1 font-mono text-4xl font-bold tabular leading-none", accentCls)}>
              {s.value}
              {s.unit ? <span className="ml-1 text-base font-normal text-muted-foreground">{s.unit}</span> : null}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
