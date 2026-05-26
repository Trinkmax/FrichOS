// Andon categories live in the `andon_categories` table.
// This module only exposes types derived from the DB row shape —
// no hardcoded SLAs, labels or escalation windows.

import type { Database } from "@/lib/types/database";

export type AndonCategoryRow = Database["public"]["Tables"]["andon_categories"]["Row"];
export type AndonCategorySlug = string;

/**
 * Server-side loader. Use from RSC / Server Actions:
 *   const cats = await loadAndonCategories(supabase)
 */
export async function loadAndonCategories(supabase: {
  from: (t: string) => {
    select: (cols: string) => {
      eq: (c: string, v: unknown) => {
        order: (c: string) => Promise<{ data: AndonCategoryRow[] | null }>;
      };
    };
  };
}): Promise<AndonCategoryRow[]> {
  const { data } = await supabase
    .from("andon_categories")
    .select("*")
    .eq("active", true)
    .order("display_order");
  return data ?? [];
}
