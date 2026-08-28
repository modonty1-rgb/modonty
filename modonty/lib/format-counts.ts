import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

/** Human Arabic counts — «صفر» reads colder than the truth, and «٢ شركاء» is broken grammar. */
export function formatClientsCount(count: number): string {
  if (count === 0) return "شركاء قريباً";
  if (count === 1) return "شريك واحد";
  if (count === 2) return "شريكان";
  if (count <= 10) return `${count.toLocaleString(SITE_LOCALE)} شركاء`;
  return `${count.toLocaleString(SITE_LOCALE)} شريكاً`;
}

export function formatArticlesCount(count: number): string {
  if (count === 0) return "مقالات قريباً";
  if (count === 1) return "مقال واحد";
  if (count === 2) return "مقالان";
  if (count <= 10) return `${count.toLocaleString(SITE_LOCALE)} مقالات`;
  return `${count.toLocaleString(SITE_LOCALE)} مقالاً`;
}
