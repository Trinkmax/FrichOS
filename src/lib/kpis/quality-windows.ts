// Quality windows live in `hold_categories` (default_window_seconds per kind).
// This module only exposes types + helpers — no hardcoded numbers.

import type { Database } from "@/lib/types/database";
import type { HoldKind } from "@/lib/types/db-enums";

export type HoldCategoryRow = Database["public"]["Tables"]["hold_categories"]["Row"];

/** HACCP danger zone — biological constant, may stay in code as a regulatory fact. */
export const HACCP_DANGER_ZONE_MIN_C = 4;
export const HACCP_DANGER_ZONE_MAX_C = 60;
export const HACCP_TEMP_THRESHOLD_C = 63;

export function expiresAtFor(windowSeconds: number, preparedAtMs: number): number {
  return preparedAtMs + windowSeconds * 1000;
}

export function remainingSeconds(windowSeconds: number, preparedAtMs: number): number {
  const expires = expiresAtFor(windowSeconds, preparedAtMs);
  return Math.max(0, Math.floor((expires - Date.now()) / 1000));
}

export type { HoldKind };
