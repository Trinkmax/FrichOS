import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-wider transition-colors",
  {
    variants: {
      tone: {
        default: "border-border bg-card text-foreground/90",
        yellow:
          "border-frich-yellow/40 bg-frich-yellow/15 text-frich-yellow",
        green: "border-signal-green/40 bg-signal-green/15 text-signal-green",
        amber: "border-signal-amber/40 bg-signal-amber/15 text-signal-amber",
        red: "border-signal-red/40 bg-signal-red/15 text-signal-red",
        outline: "border-border bg-transparent text-foreground/80",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
