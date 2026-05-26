import type { Database } from "./database";

// ============================================================
// Single source of truth for operational enums.
// All consumers (KDS, dispatcher, manager, etc.) MUST import from here
// instead of re-declaring string literal unions or constant arrays.
// If the SQL enum changes, regenerate the Database type via
// `pnpm db:types` and these will reflect automatically.
// ============================================================

export type StationSlug = Database["public"]["Enums"]["station_slug"];
export type ChannelSlug = Database["public"]["Enums"]["channel_slug"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];
export type CustomerLifecycle = Database["public"]["Enums"]["customer_lifecycle"];
export type HoldKind = Database["public"]["Enums"]["hold_kind"];
export type KitchenMode = Database["public"]["Enums"]["kitchen_mode"];
export type AndonState = Database["public"]["Enums"]["andon_state"];

// Runtime constants — derived from the typed shape so adding a new enum value
// surfaces as a compile error in any switch/exhaustiveness check.
export const STATIONS: readonly StationSlug[] = ["armado", "plancha", "freidora", "despacho"] as const;
export const CHANNELS: readonly ChannelSlug[] = ["rappi", "pedidosya", "salon", "whatsapp", "web", "kiosk"] as const;
export const KITCHEN_MODES: readonly KitchenMode[] = ["normal", "turbo", "degraded", "opening", "closing"] as const;

// Display labels (UI). i18n module will pull these via t() once enabled.
export const STATION_LABEL: Record<StationSlug, string> = {
  armado: "Armado",
  plancha: "Plancha",
  freidora: "Freidora",
  despacho: "Despacho",
};

export const CHANNEL_LABEL: Record<ChannelSlug, string> = {
  rappi: "Rappi",
  pedidosya: "PedidosYa",
  salon: "Salón",
  whatsapp: "WhatsApp",
  web: "Web",
  kiosk: "Kiosko",
};

export const KITCHEN_MODE_LABEL: Record<KitchenMode, string> = {
  normal: "Normal",
  turbo: "Turbo",
  degraded: "Degradado",
  opening: "Apertura",
  closing: "Cierre",
};
