"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Schema = z.object({ chainSlug: z.string(), count: z.number().int().min(1).max(7).optional() });

// Templates live in `kaizen_templates` (DB). The RPC picks them randomly and
// inserts into kaizen_hypotheses tagging them to the chain.
export async function generateKaizenHypotheses(input: unknown) {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Input inválido" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("generate_kaizen_hypotheses_for_chain", {
    p_chain_slug: parsed.data.chainSlug,
    p_count: parsed.data.count ?? 3,
  });
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/c/[chainSlug]/kaizen", "page");
  return { ok: true as const, created: (data as unknown as unknown[])?.length ?? 0 };
}
