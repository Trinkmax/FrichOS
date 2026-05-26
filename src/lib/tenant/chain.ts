import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";


export type ChainContext = {
  id: string;
  slug: string;
  name: string;
  brand_color: string | null;
  logo_url: string | null;
  settings: Record<string, unknown> | null;
};

/**
 * Resolve the current tenant chain from the request path.
 * Cached per-request via React cache().
 */
export const getCurrentChain = cache(async (): Promise<ChainContext | null> => {
  const h = await headers();
  const slug = h.get("x-frich-chain-slug");
  if (!slug) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chains" as never)
    .select("id, slug, name, brand_color, logo_url, settings")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as ChainContext;
});

export async function requireChain(): Promise<ChainContext> {
  const chain = await getCurrentChain();
  if (!chain) {
    throw new Error("Chain not found for slug in path. Check middleware + RLS.");
  }
  return chain;
}
