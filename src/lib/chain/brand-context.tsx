"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { BrandSettings } from "./config";

const BrandContext = createContext<BrandSettings | null>(null);

export function BrandProvider({ value, children }: { value: BrandSettings; children: ReactNode }) {
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandSettings {
  const ctx = useContext(BrandContext);
  if (!ctx) {
    // Demo default — outside the manager layout (landing, login, PIN) we still want
    // the Frich identity. Multi-tenant flows always wrap with BrandProvider so this
    // path only fires for the marketing surface.
    return {
      name: "Frich",
      tagline: "American Burgers 'n Fries",
      logoUrl: "/brand/frich-logo.png",
      primaryColor: "#FCD33B",
      secondaryColor: "#0B0B0E",
    };
  }
  return ctx;
}
