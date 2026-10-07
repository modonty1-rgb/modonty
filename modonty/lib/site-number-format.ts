import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

/** The site's plain number formatter — one `Intl.NumberFormat(SITE_LOCALE)` instead of a copy per card. */
export const siteNumberFormat = new Intl.NumberFormat(SITE_LOCALE);
