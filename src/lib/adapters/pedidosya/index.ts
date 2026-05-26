import "server-only";

import { simulateIncomingOrder as rappi } from "@/lib/adapters/rappi";

export function simulateIncomingOrder() {
  const order = rappi();
  return { ...order, externalId: order.externalId.replace("rappi", "py"), channel: "pedidosya" as const };
}
