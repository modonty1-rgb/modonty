import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { fill, messages } from "@/lib/i18n/messages";

const t = messages.modonty.education.freeLearning;
const N = new Intl.NumberFormat(SITE_LOCALE, { maximumFractionDigits: 1 });

/** «ساعة ونص» said as a number: under an hour in minutes, otherwise in hours. */
export const formatDuration = (minutes: number) => (minutes < 60 ? fill(t.minutes, { n: N.format(minutes) }) : fill(t.hours, { n: N.format(Math.round(minutes / 30) / 2) }));
