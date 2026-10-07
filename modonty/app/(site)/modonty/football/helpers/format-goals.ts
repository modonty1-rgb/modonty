import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

/** A side's goals as a site-locale numeral; a side with no score yet reads «٠». */
export const formatGoals = (n: number | null) => (n ?? 0).toLocaleString(SITE_LOCALE);
