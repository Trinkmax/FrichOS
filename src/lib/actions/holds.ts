"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const CreateHoldSchema = z.object({
  locationId: z.string().uuid(),
  kind: z.enum(["patty_cooked", "caramelized_onion", "blanched_fries", "toasted_bun", "assembled_burger"]),
  qty: z.number().int().positive().max(48),
});

export async function createHoldBatch(input: unknown) {
  const parsed = CreateHoldSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.errors[0]?.message ?? "Input inválido" };

  const supabase = await createClient();
  // Resolve chain via location
  const { data: loc } = await supabase
    .from("locations")
    .select("chain_id")
    .eq("id", parsed.data.locationId)
    .maybeSingle();
  if (!loc) return { ok: false as const, error: "Local no encontrado" };

  const { data: cat } = await supabase
    .from("hold_categories")
    .select("default_window_seconds")
    .eq("kind", parsed.data.kind)
    .maybeSingle();
  const window = cat?.default_window_seconds ?? 600;

  const prepared = new Date();
  const expires = new Date(prepared.getTime() + window * 1000);

  const { data, error } = await supabase
    .from("quality_hold_batches")
    .insert({
      chain_id: loc.chain_id,
      location_id: parsed.data.locationId,
      kind: parsed.data.kind,
      qty_initial: parsed.data.qty,
      qty_remaining: parsed.data.qty,
      prepared_at: prepared.toISOString(),
      expires_at: expires.toISOString(),
      status: "active",
    })
    .select("*, locations(short_name)")
    .single();
  if (error || !data) return { ok: false as const, error: error?.message ?? "No se pudo crear" };

  revalidatePath("/c/[chainSlug]/holds", "page");
  return { ok: true as const, batch: data };
}

const DiscardSchema = z.object({ batchId: z.string().uuid() });

export async function discardHoldBatch(input: unknown) {
  const parsed = DiscardSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Input inválido" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("quality_hold_batches")
    .update({ status: "discarded", qty_discarded: 0 })
    .eq("id", parsed.data.batchId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/c/[chainSlug]/holds", "page");
  return { ok: true as const };
}
