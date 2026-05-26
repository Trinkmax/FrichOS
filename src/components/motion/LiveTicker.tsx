"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Tabular timer that ticks every second client-side without re-rendering the
 * server tree. Avoids hydration mismatch by deferring "now" until mounted.
 */
export function LiveTicker({
  startedAt,
  targetSeconds,
  className,
  showSign = false,
}: {
  startedAt: Date | string | number;
  targetSeconds?: number;
  className?: string;
  showSign?: boolean;
}) {
  const start = new Date(startedAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return <span className={cn("tabular text-muted-foreground", className)}>--:--</span>;
  }

  const elapsed = Math.floor((now - start) / 1000);
  const display = targetSeconds ? targetSeconds - elapsed : elapsed;
  const abs = Math.abs(display);
  const minutes = Math.floor(abs / 60);
  const seconds = abs % 60;
  const sign = showSign && display < 0 ? "-" : "";
  const isOver = targetSeconds !== undefined && elapsed > targetSeconds;

  return (
    <motion.span
      animate={
        isOver
          ? { color: ["#EF3E3E", "#FF7676", "#EF3E3E"] }
          : { color: "currentColor" }
      }
      transition={{ duration: 1.2, repeat: Infinity }}
      className={cn("tabular font-mono leading-none", className)}
    >
      {sign}
      {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </motion.span>
  );
}
