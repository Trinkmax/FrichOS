"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ResolveSchema = z.object({
  andonId: z.string().uuid(),
  rootCause: z.string().optional(),
});

export async function resolveAndon(input: unknown) {
  const parsed = ResolveSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Input inválido" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("andon_pulls")
    .update({
      state: "resolved",
      resolved_at: new Date().toISOString(),
      root_cause: parsed.data.rootCause ?? null,
    })
    .eq("id", parsed.data.andonId);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/c/[chainSlug]/andon", "page");
  revalidatePath("/c/[chainSlug]/dashboard", "page");
  return { ok: true as const };
}
