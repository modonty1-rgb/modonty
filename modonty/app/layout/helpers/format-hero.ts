import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

/** «+٣٩٦ ألف» — يُقطع للأسفل لا يُقرَّب، فالـ«+» صادقة دائماً (الرقم الحقيقيّ أكبر أو يساوي). */
export function formatHero(n: number): string {
  const f = (v: number) => v.toLocaleString(SITE_LOCALE, { maximumFractionDigits: 1 });
  if (n >= 1_000_000) return `+${f(Math.floor(n / 100_000) / 10)} مليون`;
  if (n >= 10_000) return `+${f(Math.floor(n / 1000))} ألف`;
  return n.toLocaleString(SITE_LOCALE);
}
