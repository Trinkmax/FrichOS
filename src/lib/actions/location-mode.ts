"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { KITCHEN_MODES, type KitchenMode } from "@/lib/types/db-enums";

const SetModeSchema = z.object({
  locationId: z.string().uuid(),
  mode: z.enum(KITCHEN_MODES as readonly [KitchenMode, ...KitchenMode[]]),
});

export type SetLocationModeResult =
  | { ok: true; previousMode: KitchenMode; newMode: KitchenMode }
  | { ok: false; error: string };

export async function setLocationMode(input: unknown): Promise<SetLocationModeResult> {
  const parsed = SetModeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Input inválido" };

  const supabase = await createClient();

  const { data: existing, error: readError } = await supabase
    .from("locations")
    .select("id, current_mode")
    .eq("id", parsed.data.locationId)
    .maybeSingle();
  if (readError || !existing) {
    return { ok: false, error: readError?.message ?? "Local no encontrado" };
  }

  const previousMode = existing.current_mode as KitchenMode;
  if (previousMode === parsed.data.mode) {
    return { ok: true, previousMode, newMode: parsed.data.mode };
  }

  const { error } = await supabase
    .from("locations")
    .update({ current_mode: parsed.data.mode, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.locationId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/c/[chainSlug]/noc", "page");
  revalidatePath("/c/[chainSlug]/dashboard", "page");

  return { ok: true, previousMode, newMode: parsed.data.mode };
}
