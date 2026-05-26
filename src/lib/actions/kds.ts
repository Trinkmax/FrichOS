"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getPinSession } from "@/lib/auth/session";
import type { AndonCategorySlug } from "@/lib/andon/categories";
// AndonCategorySlug is now `string` (DB-driven). For the limited set of slugs
// the KDS Andon dialog supports, we re-list them as a Zod enum below.

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

const TaskActionSchema = z.object({
  taskId: z.string().uuid(),
  employeeId: z.string().uuid(),
  locationId: z.string().uuid(),
});

async function assertSessionMatches(employeeId: string, locationId: string) {
  const session = await getPinSession();
  if (!session) return "Sesión expirada — volvé a ingresar con PIN";
  if (session.employeeId !== employeeId) return "Empleado no coincide con sesión";
  if (session.locationId !== locationId) return "Local mismatch";
  return null;
}

export async function startTask(input: unknown): Promise<Result> {
  const parsed = TaskActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Input inválido" };

  const guard = await assertSessionMatches(parsed.data.employeeId, parsed.data.locationId);
  if (guard) return { ok: false, error: guard };

  const supabase = await createClient();
  const { error } = await supabase.rpc("kds_start_task" as never, {
    p_task_id: parsed.data.taskId,
    p_employee_id: parsed.data.employeeId,
  } as never);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/c/[chainSlug]/kds/[stationSlug]", "page");
  return { ok: true };
}

export async function completeTask(input: unknown): Promise<Result> {
  const parsed = TaskActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Input inválido" };

  const guard = await assertSessionMatches(parsed.data.employeeId, parsed.data.locationId);
  if (guard) return { ok: false, error: guard };

  const supabase = await createClient();
  const { error } = await supabase.rpc("kds_complete_task" as never, {
    p_task_id: parsed.data.taskId,
    p_employee_id: parsed.data.employeeId,
  } as never);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/c/[chainSlug]/kds/[stationSlug]", "page");
  return { ok: true };
}

const AndonSchema = z.object({
  locationId: z.string().uuid(),
  stationSlug: z.string(),
  employeeId: z.string().uuid(),
  categorySlug: z
    .enum([
      "ingrediente_faltante",
      "equipo_fallado",
      "accidente",
      "pedido_mal_cargado",
      "queja_mostrador",
      "calidad_producto",
      "limpieza_critica",
      "conflicto_personal",
      "driver_demora",
      "alergeno_riesgo",
      "haccp_temperatura",
      "otro",
    ])
    .optional()
    .default("otro"),
  note: z.string().max(500).optional(),
}) satisfies z.ZodType<{
  locationId: string;
  stationSlug: string;
  employeeId: string;
  categorySlug?: AndonCategorySlug;
  note?: string;
}>;

export async function pullAndon(input: unknown): Promise<Result> {
  const parsed = AndonSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Input inválido" };

  const guard = await assertSessionMatches(parsed.data.employeeId, parsed.data.locationId);
  if (guard) return { ok: false, error: guard };

  const supabase = await createClient();
  const { error } = await supabase.rpc("andon_pull" as never, {
    p_location_id: parsed.data.locationId,
    p_station_slug: parsed.data.stationSlug,
    p_employee_id: parsed.data.employeeId,
    p_category_slug: parsed.data.categorySlug,
    p_note: parsed.data.note ?? null,
  } as never);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/c/[chainSlug]/kds/[stationSlug]", "page");
  revalidatePath("/c/[chainSlug]/dashboard", "page");
  return { ok: true };
}
