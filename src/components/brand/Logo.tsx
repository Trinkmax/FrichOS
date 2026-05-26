"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { useBrand } from "@/lib/chain/brand-context";

/** Native aspect ratio of the Frich logo (1080×918 = 1.18). Other chains' logos
 *  will use their own. Width = height × this ratio. */
const FALLBACK_LOGO_RATIO = 1.18;

export function ChainLogo({
  className,
  height = 56,
  priority = false,
}: {
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  const brand = useBrand();
  const width = Math.round(height * FALLBACK_LOGO_RATIO);
  if (!brand.logoUrl) {
    return (
      <span
        className={cn("font-display tracking-tight leading-none brand-headline-lg", className)}
        style={{ color: brand.primaryColor, fontSize: height * 0.7 }}
      >
        {brand.name}
      </span>
    );
  }
  return (
    <Image
      src={brand.logoUrl}
      alt={brand.name}
      width={width}
      height={height}
      priority={priority}
      className={cn("select-none", className)}
      style={{ height, width: "auto" }}
    />
  );
}

/**
 * Wordmark = brand identity + " OS " suffix.
 * If the chain has a logo image (chains.settings.brand.logo_url) we render the
 * actual artwork (PNG/SVG) — that's the brand the customer paid for.
 * If not, we synthesize a cursive wordmark with stroke as fallback.
 */
export function Wordmark({
  className,
  size = "md",
  tone = "yellow",
  override,
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "primary" | "yellow" | "frost" | "carbon";
  override?: { name: string; primaryColor: string; logoUrl?: string | null };
}) {
  const ctx = useBrand();
  const brand = override
    ? { name: override.name, primaryColor: override.primaryColor, logoUrl: override.logoUrl ?? null }
    : { name: ctx.name, primaryColor: ctx.primaryColor, logoUrl: ctx.logoUrl };

  const logoHeightPx = { sm: 32, md: 48, lg: 64, xl: 96 }[size];

  // Real artwork path — always preferred when available. No "OS" suffix here:
  // the logo already carries the brand mark and adding " OS" duplicates noise.
  if (brand.logoUrl) {
    return (
      <div className={cn("inline-flex items-center justify-center select-none", className)}>
        <Image
          src={brand.logoUrl}
          alt={brand.name}
          width={Math.round(logoHeightPx * FALLBACK_LOGO_RATIO)}
          height={logoHeightPx}
          priority
          style={{ height: logoHeightPx, width: "auto" }}
        />
      </div>
    );
  }

  // Fallback synthesized cursive wordmark.
  const sizeCls = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
  }[size];
  const strokeCls = {
    sm: "",
    md: "brand-headline",
    lg: "brand-headline-lg",
    xl: "brand-headline-xl",
  }[size];
  const colorStyle =
    tone === "yellow" || tone === "primary" ? { color: brand.primaryColor } : undefined;
  const toneCls =
    tone === "frost" ? "text-foreground" : tone === "carbon" ? "text-background" : undefined;

  return (
    <div className={cn("inline-flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-display tracking-tight leading-none",
          sizeCls,
          toneCls,
          tone !== "frost" && tone !== "carbon" && strokeCls,
        )}
        style={colorStyle}
      >
        {brand.name}
      </span>
      <span
        className={cn(
          "font-mono uppercase tracking-[0.18em] leading-none text-muted-foreground",
          size === "xl" ? "text-base" : "text-[0.6em]",
        )}
      >
        OS
      </span>
    </div>
  );
}

/** RSC-friendly variant: receives name + color via prop, no context needed. */
export function StaticWordmark({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeCls = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
  }[size];
  const strokeCls = {
    sm: "",
    md: "brand-headline",
    lg: "brand-headline-lg",
    xl: "brand-headline-xl",
  }[size];
  return (
    <div className={cn("inline-flex items-baseline gap-2", className)}>
      <span
        className={cn("font-display tracking-tight leading-none", sizeCls, strokeCls)}
        style={{ color }}
      >
        {name}
      </span>
      <span
        className={cn(
          "font-mono uppercase tracking-[0.18em] leading-none text-muted-foreground",
          size === "xl" ? "text-base" : "text-[0.6em]",
        )}
      >
        OS
      </span>
    </div>
  );
}

/** Backwards-compatible alias for the old import name. */
export const FrichLogo = ChainLogo;
