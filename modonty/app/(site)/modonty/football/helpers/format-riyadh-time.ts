import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

/** «٩:٠٠ م» in Riyadh time, whatever zone the server runs in. */
export function formatRiyadhTime(iso: string): string {
  return new Intl.DateTimeFormat(SITE_LOCALE, { timeZone: "Asia/Riyadh", hour: "numeric", minute: "2-digit" }).format(
    new Date(iso),
  );
}
