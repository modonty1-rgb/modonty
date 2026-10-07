import type { NameVal } from "@/lib/analytics/ga4";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

export function buildHourItems(byHour: NameVal[]): NameVal[] {
  return byHour
    .slice()
    .sort((x, y) => Number(x.name) - Number(y.name))
    .map((h) => ({ name: `${Number(h.name).toLocaleString(SITE_LOCALE)}:٠٠`, value: h.value }));
}
