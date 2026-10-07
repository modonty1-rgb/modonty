import { SITE_LOCALE_GREGORIAN } from "@modonty/shared/lib/constants/locale";

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}
