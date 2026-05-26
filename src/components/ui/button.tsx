import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-frich-yellow focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-frich-yellow text-frich-carbon hover:bg-frich-yellow-hot shadow-[0_4px_14px_-4px_rgba(252,211,59,0.5)]",
        secondary:
          "bg-card text-foreground border border-border hover:bg-secondary",
        ghost: "text-foreground hover:bg-card",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-card",
        danger: "bg-signal-red text-white hover:bg-signal-red-hot",
        success: "bg-signal-green text-frich-carbon hover:opacity-90",
        warning: "bg-signal-amber text-frich-carbon hover:opacity-90",
        link: "text-frich-yellow underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg [&_svg]:size-5",
        kds: "h-16 px-6 text-lg [&_svg]:size-6 rounded-xl font-semibold",
        icon: "h-10 w-10",
        iconLg: "h-12 w-12",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
