import { SITE_LOCALE_GREGORIAN } from "@modonty/shared/lib/constants/locale";

export function formatDateTimeValue(d: Date | string): string {
  return new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}
