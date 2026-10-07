import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

export const ar = (n: number) => Math.round(n).toLocaleString(SITE_LOCALE);
