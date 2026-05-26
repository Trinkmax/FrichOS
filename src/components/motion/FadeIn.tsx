"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { fadeUp } from "@/lib/design/motion";

type FadeInProps = HTMLMotionProps<"div"> & { delay?: number };

export function FadeIn({ delay = 0, children, ...rest }: FadeInProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeUp}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
