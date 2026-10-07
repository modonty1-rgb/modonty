import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

export const formatNumber = (v: number) => v.toLocaleString(SITE_LOCALE);
