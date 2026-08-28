import { cacheLife } from "next/cache";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

/**
 * The footer's © year. Read under `use cache` because Next 16 forbids `new Date()` in a
 * server component that is part of the prerender; a day-long cache is exact enough for a
 * year and keeps the footer in the static shell.
 */
export async function getCopyrightYear(): Promise<string> {
  "use cache";
  cacheLife("days");
  return new Intl.DateTimeFormat(SITE_LOCALE, { year: "numeric" }).format(new Date());
}
