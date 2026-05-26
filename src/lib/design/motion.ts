import type { Transition, Variants } from "motion/react";

/**
 * Spring physics presets — Frich OS motion language.
 * Calibrated to feel "industrial-confident" not "playful".
 */
export const springs = {
  /** Quick UI feedback (button press, toggle) */
  snap: { type: "spring", stiffness: 380, damping: 28, mass: 0.6 } satisfies Transition,
  /** Card movement (FLIP between stations, list reorder) */
  card: { type: "spring", stiffness: 220, damping: 24, mass: 0.9 } satisfies Transition,
  /** Heavy moves (page transition, modal) */
  heavy: { type: "spring", stiffness: 140, damping: 22, mass: 1.1 } satisfies Transition,
  /** Soft fade for ambient indicators */
  ambient: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } satisfies Transition,
} as const;

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: springs.card },
  exit: { opacity: 0, y: -8, transition: springs.ambient },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: springs.ambient },
  exit: { opacity: 0, transition: springs.ambient },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: springs.snap },
  exit: { opacity: 0, scale: 0.94, transition: springs.ambient },
};

export const stationCardEnter: Variants = {
  initial: { opacity: 0, x: -24, scale: 0.97 },
  animate: { opacity: 1, x: 0, scale: 1, transition: springs.card },
  exit: { opacity: 0, x: 24, scale: 0.95, transition: springs.ambient },
};

export const slaPulse: Variants = {
  green: { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
  amber: {
    boxShadow: [
      "0 0 0 0 rgba(245,158,11,0.5)",
      "0 0 0 12px rgba(245,158,11,0)",
      "0 0 0 0 rgba(245,158,11,0.5)",
    ],
    transition: { duration: 2.0, repeat: Infinity },
  },
  red: {
    boxShadow: [
      "0 0 0 0 rgba(239,62,62,0.6)",
      "0 0 0 16px rgba(239,62,62,0)",
      "0 0 0 0 rgba(239,62,62,0.6)",
    ],
    transition: { duration: 1.2, repeat: Infinity },
  },
};

export const staggerChildren = (delay = 0.04) => ({
  animate: { transition: { staggerChildren: delay } },
});
