import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

const COOKIE_NAME = "frich_locale";

export default getRequestConfig(async () => {
  // 1) explicit cookie wins
  const jar = await cookies();
  const cookieLocale = jar.get(COOKIE_NAME)?.value;
  let locale: Locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  // 2) accept-language fallback (only used if no cookie)
  if (!isLocale(cookieLocale)) {
    const h = await headers();
    const accept = h.get("accept-language") ?? "";
    if (accept.toLowerCase().includes("en") && !accept.toLowerCase().includes("es")) {
      locale = "en";
    }
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages };
});
