// next-intl config — i18n base.
// Default locale: es-AR (Argentine Spanish — Frich's market).
// Add languages by dropping a JSON file in `messages/`.

export type Locale = "es-AR" | "en";

export const LOCALES: Locale[] = ["es-AR", "en"];
export const DEFAULT_LOCALE: Locale = "es-AR";

export function isLocale(input: unknown): input is Locale {
  return typeof input === "string" && (LOCALES as readonly string[]).includes(input);
}
