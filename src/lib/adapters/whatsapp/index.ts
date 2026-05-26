import "server-only";

/**
 * WhatsApp Cloud API adapter.
 * - En modo demo o sin credenciales: registra el "envío" en DB (whatsapp_messages)
 *   y devuelve un message_id falso. No hace HTTP.
 * - En modo real: usa Cloud API v20+.
 */

import { createAdminClient } from "@/lib/supabase/admin";

type SendTextInput = {
  chainId: string;
  to: string;
  body: string;
  threadId?: string;
  templateName?: string;
};

type SendResult = { messageId: string; mode: "mock" | "live" };

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function sendText(input: SendTextInput): Promise<SendResult> {
  const live = !!(PHONE_NUMBER_ID && ACCESS_TOKEN) && process.env.FRICH_DEMO_MODE !== "true";

  let messageId = `mock_${crypto.randomUUID()}`;
  if (live) {
    const res = await fetch(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: input.to,
        type: "text",
        text: { body: input.body },
      }),
    });
    if (!res.ok) throw new Error(`WhatsApp send failed: ${res.status}`);
    const data = (await res.json()) as { messages: { id: string }[] };
    messageId = data.messages[0]?.id ?? messageId;
  }

  // Persist either way for audit + UI surface
  const admin = createAdminClient();
  // The cast is intentional — DB types are regenerated post-migration.
  await admin
    .from("whatsapp_messages" as never)
    .insert({
      chain_id: input.chainId,
      direction: "out",
      to_phone: input.to,
      body: input.body,
      template_name: input.templateName ?? null,
      provider_message_id: messageId,
      thread_id: input.threadId ?? null,
      sent_at: new Date().toISOString(),
      mode: live ? "live" : "mock",
    } as never);

  return { messageId, mode: live ? "live" : "mock" };
}

export const Templates = {
  orderConfirmed(brand: string, etaMinutes: number) {
    return `Hola! Soy ${brand}. Recibimos tu pedido 🍔
Tiempo estimado: *${etaMinutes} min*.
Te aviso cuando entre a cocina y cuando salga.`;
  },
  inKitchen() {
    return `Tu burguer ya está en plancha 🔥`;
  },
  dispatched(driverName: string | null, etaMinutes: number) {
    const who = driverName ? `${driverName} (repartidor)` : "el repartidor";
    return `Tu pedido salió con ${who}. Llega en aprox. *${etaMinutes} min*.`;
  },
  feedbackRequest(brand: string) {
    return `¿Cómo estuvo todo, ${brand} fan? Puntuá del 1 al 5 respondiendo este mensaje.`;
  },
  feedback5Star(googleLink: string) {
    return `¡Nos hiciste el día! 🌟 Si te animás, dejá una reseña acá: ${googleLink}`;
  },
  feedbackLow() {
    return `Disculpá. ¿Qué falló? Tocá: 1) Comida · 2) Tiempo · 3) Driver · 4) Otro — o contanos.`;
  },
};
