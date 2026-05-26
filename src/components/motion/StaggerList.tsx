"use client";

import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { springs, stationCardEnter } from "@/lib/design/motion";

type StaggerListProps<T> = {
  items: T[];
  getKey: (item: T, index: number) => string;
  children: (item: T, index: number) => React.ReactNode;
  className?: string;
  layout?: boolean;
  staggerDelay?: number;
};

export function StaggerList<T>({
  items,
  getKey,
  children,
  className,
  layout = true,
  staggerDelay = 0.04,
}: StaggerListProps<T>) {
  return (
    <motion.ul
      className={className}
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: staggerDelay } } }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item, index) => (
          <motion.li
            key={getKey(item, index)}
            layout={layout}
            variants={stationCardEnter}
            exit={{ opacity: 0, scale: 0.94, transition: springs.ambient }}
          >
            {children(item, index)}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
