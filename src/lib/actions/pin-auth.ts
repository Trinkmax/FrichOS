"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { encode, setPinSessionCookie } from "@/lib/auth/session";

const PinSchema = z.object({
  chainSlug: z.string().min(1),
  employeeId: z.string().uuid(),
  pin: z.string().regex(/^\d{4}$/),
  stationSlug: z.enum(["armado", "plancha", "freidora", "despacho"]),
});

export type PinSignInResult =
  | { ok: true; locationId: string }
  | { ok: false; error: string };

export async function signInWithPin(input: unknown): Promise<PinSignInResult> {
  const parsed = PinSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos" };
  }

  const { chainSlug, employeeId, pin, stationSlug } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("verify_employee_pin", {
    p_chain_slug: chainSlug,
    p_employee_id: employeeId,
    p_pin: pin,
    p_station_slug: stationSlug,
  });

  if (error) return { ok: false, error: error.message };
  const row = (data as unknown as Array<{
    employee_id: string;
    chain_id: string;
    location_id: string;
    first_name: string;
    station_id: string | null;
  }>)[0];
  if (!row) return { ok: false, error: "PIN incorrecto" };

  const token = encode({
    chainId: row.chain_id,
    locationId: row.location_id,
    stationId: row.station_id,
    employeeId: row.employee_id,
    employeeName: row.first_name,
    shiftId: null,
  });
  await setPinSessionCookie(token);

  return { ok: true, locationId: row.location_id };
}
