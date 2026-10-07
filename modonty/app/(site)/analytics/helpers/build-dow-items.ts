import type { NameVal } from "@/lib/analytics/ga4";

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function buildDowItems(byDayOfWeek: NameVal[]): NameVal[] {
  return byDayOfWeek
    .slice()
    .sort((x, y) => Number(x.name) - Number(y.name))
    .map((d) => ({ name: DAYS_AR[Number(d.name)] ?? d.name, value: d.value }));
}
