import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

/** «شريك واحد» / «شريكان» / «٢١ شريك» — «1 شريك» is not something anyone says out loud. */
export function formatPartnerCount(count: number): string {
  if (count === 1) return "شريك واحد جاهز";
  if (count === 2) return "شريكان جاهزان";
  return `${new Intl.NumberFormat(SITE_LOCALE).format(count)} شريك جاهز`;
}
