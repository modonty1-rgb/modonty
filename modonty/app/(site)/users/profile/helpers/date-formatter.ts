import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

export const dateFormatter = new Intl.DateTimeFormat(SITE_LOCALE, {
  year: "numeric",
  month: "short",
  day: "numeric",
});
