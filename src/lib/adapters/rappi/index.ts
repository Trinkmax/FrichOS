import "server-only";

/**
 * Rappi partner adapter.
 * Mock by default. Real integration is gated by RAPPI_PARTNER_KEY.
 *
 * Public surface:
 * - simulateIncomingOrder(): genera un pedido entrante con composición realista de la carta Frich.
 * - markItem86(productId, on): activa o desactiva el ítem en la plataforma.
 * - driverEta(orderId): devuelve ETA de repartidor en segundos.
 */

import type { ComplexityInput } from "@/lib/kpis/sla";

export type IncomingOrder = {
  externalId: string;
  channel: "rappi";
  customerPhone: string;
  customerName: string;
  items: { productSlug: string; qty: number; modifiers: string[] }[];
  receivedAt: string;
  estimatedDriverArrivalSeconds: number;
};

const DEMO_PRODUCTS = [
  { slug: "doble-cheese", weight: 4, modifiers: ["sin pepinillo", "extra ketchup"] },
  { slug: "california", weight: 3, modifiers: ["sin tomate"] },
  { slug: "bell-pepper", weight: 2, modifiers: [] },
  { slug: "fried-onion", weight: 2, modifiers: [] },
  { slug: "western", weight: 2, modifiers: ["sin cebolla"] },
  { slug: "patty-melt", weight: 2, modifiers: [] },
  { slug: "chicken-deluxe", weight: 3, modifiers: ["sin lechuga"] },
  { slug: "chicken-spicy", weight: 2, modifiers: [] },
  { slug: "crunch", weight: 1, modifiers: ["sin tomate"] },
  { slug: "nuggets-10", weight: 2, modifiers: [] },
];

function weightedRandom<T extends { weight: number }>(arr: T[]): T {
  const total = arr.reduce((acc, x) => acc + x.weight, 0);
  let r = Math.random() * total;
  for (const x of arr) {
    r -= x.weight;
    if (r <= 0) return x;
  }
  return arr[0]!;
}

export function simulateIncomingOrder(): IncomingOrder {
  const itemCount = 1 + Math.floor(Math.random() * 3); // 1..3 items
  const items: IncomingOrder["items"] = [];
  for (let i = 0; i < itemCount; i++) {
    const p = weightedRandom(DEMO_PRODUCTS);
    items.push({
      productSlug: p.slug,
      qty: 1 + (Math.random() < 0.15 ? 1 : 0),
      modifiers:
        Math.random() < 0.5
          ? p.modifiers.slice(0, 1 + Math.floor(Math.random() * p.modifiers.length))
          : [],
    });
  }
  return {
    externalId: `rappi_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    channel: "rappi",
    customerPhone: `+549351${5_000_000 + Math.floor(Math.random() * 5_000_000)}`,
    customerName: ["Ana", "Bruno", "Caro", "Diego", "Eli", "Fede", "Gabi", "Hernán"][
      Math.floor(Math.random() * 8)
    ]!,
    items,
    receivedAt: new Date().toISOString(),
    estimatedDriverArrivalSeconds: 6 * 60 + Math.floor(Math.random() * 10 * 60),
  };
}

// Heavy items: high σ on armado/plancha — slugs marked as "heavy" come from
// product_station_steps.sigma_seconds in DB. Hardcoded here only for mock simulation.
const HEAVY_SLUGS = new Set(["fried-onion", "crunch", "patty-melt", "western", "egg-n-bacon"]);

export function complexityFromItems(items: IncomingOrder["items"]): ComplexityInput {
  return {
    itemCount: items.reduce((a, i) => a + i.qty, 0),
    modifierCount: items.reduce((a, i) => a + i.modifiers.length, 0),
    heavyItemFlags: items.filter((i) => HEAVY_SLUGS.has(i.productSlug)).map((i) => i.productSlug),
  };
}

export async function markItem86(_productSlug: string, _enabled: boolean): Promise<void> {
  // mock — in live mode would call partner API
}

export async function driverEta(_externalOrderId: string): Promise<number> {
  return 3 * 60 + Math.floor(Math.random() * 7 * 60);
}
