"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { simulateIncomingOrder as rappiSim } from "@/lib/adapters/rappi";
import { simulateIncomingOrder as pySim } from "@/lib/adapters/pedidosya";
import { sendText, Templates } from "@/lib/adapters/whatsapp";

const ItemsSchema = z.array(z.object({ productSlug: z.string(), qty: z.number().int().positive() })).min(1);

const ManualOrderSchema = z.object({
  chainSlug: z.string(),
  locationSlug: z.string(),
  channel: z.enum(["rappi", "pedidosya", "salon", "whatsapp", "web", "kiosk"]),
  customerName: z.string(),
  customerPhone: z.string().nullable(),
  items: ItemsSchema,
  isVip: z.boolean().optional().default(false),
});

type OrderResult = { ok: true; orderId: string; orderCode: string } | { ok: false; error: string };

async function resolveLocation(chainSlug: string, locationSlug: string) {
  const supabase = await createClient();
  const { data: chain } = await supabase
    .from("chains")
    .select("id")
    .eq("slug", chainSlug)
    .maybeSingle();
  if (!chain) return null;
  const { data: location } = await supabase
    .from("locations")
    .select("id")
    .eq("chain_id", chain.id)
    .eq("slug", locationSlug)
    .maybeSingle();
  if (!location) return null;
  return { chainId: chain.id, locationId: location.id };
}

export async function placeManualOrder(input: unknown): Promise<OrderResult> {
  const parsed = ManualOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Input inválido" };

  const supabase = await createClient();
  const ctx = await resolveLocation(parsed.data.chainSlug, parsed.data.locationSlug);
  if (!ctx) return { ok: false, error: "Local no encontrado" };

  const { data, error } = await supabase.rpc("place_order_with_items", {
    p_chain_id: ctx.chainId,
    p_location_id: ctx.locationId,
    p_channel: parsed.data.channel,
    p_customer_name: parsed.data.customerName,
    p_customer_phone: parsed.data.customerPhone,
    p_items: parsed.data.items.map((i) => ({ product_slug: i.productSlug, qty: i.qty, modifiers: [] })),
    p_is_vip: parsed.data.isVip,
  });
  if (error || !data) return { ok: false, error: error?.message ?? "No se pudo crear el pedido" };

  const orderRow = (data as unknown as { id: string; order_code: string; chain_id: string; sla_target_at: string }[])[0]
    ?? (data as unknown as { id: string; order_code: string; chain_id: string; sla_target_at: string });

  if (parsed.data.customerPhone) {
    try {
      const etaMin = Math.max(5, Math.round((new Date(orderRow.sla_target_at).getTime() - Date.now()) / 60_000));
      await sendText({
        chainId: orderRow.chain_id,
        to: parsed.data.customerPhone,
        body: Templates.orderConfirmed("Frich", etaMin),
        templateName: "order_confirmed",
      });
    } catch {
      /* mock — ignore */
    }
  }

  revalidatePath(`/c/${parsed.data.chainSlug}/dashboard`);
  return { ok: true, orderId: orderRow.id, orderCode: orderRow.order_code };
}

const SimulateSchema = z.object({
  chainSlug: z.string(),
  locationSlug: z.string(),
  channel: z.enum(["rappi", "pedidosya", "whatsapp"]),
});

export async function simulateChannelOrder(input: unknown): Promise<OrderResult> {
  const parsed = SimulateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Input inválido" };

  const sim =
    parsed.data.channel === "rappi"
      ? rappiSim()
      : parsed.data.channel === "pedidosya"
        ? pySim()
        : (() => {
            const r = rappiSim();
            return { ...r, externalId: r.externalId.replace("rappi", "wa"), channel: "whatsapp" as const };
          })();

  return placeManualOrder({
    chainSlug: parsed.data.chainSlug,
    locationSlug: parsed.data.locationSlug,
    channel: parsed.data.channel,
    customerName: sim.customerName,
    customerPhone: sim.customerPhone,
    items: sim.items.map((i) => ({ productSlug: i.productSlug, qty: i.qty })),
    isVip: false,
  });
}
