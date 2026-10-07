import { formatArabic12h } from "./format-arabic-12h";
import { DAY_LABELS_AR, DAY_ORDER } from "./opening-hours-days";
import type { OpeningHoursSpec } from "./opening-hours-spec";

export interface OpeningHoursRow {
  label: string;
  time: string;
  isToday: boolean;
}

/** Map specs onto the 7-day order, group consecutive same-time days into ranges. */
export function buildOpeningHoursRows(specs: OpeningHoursSpec[], todayName: string): OpeningHoursRow[] {
  const byDay = new Map<string, { opens: string; closes: string }>();
  for (const spec of specs) {
    const days = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek : [spec.dayOfWeek];
    for (const d of days) {
      if (d in DAY_LABELS_AR) byDay.set(d, { opens: spec.opens, closes: spec.closes });
    }
  }
  if (byDay.size === 0) return [];

  const timeFor = (day: string): string => {
    const entry = byDay.get(day);
    if (!entry || !entry.opens || !entry.closes) return "مغلق";
    return `${formatArabic12h(entry.opens)} – ${formatArabic12h(entry.closes)}`;
  };

  // Only include days that exist in the data, preserving the Gulf week order.
  const present: string[] = DAY_ORDER.filter((d) => byDay.has(d));
  const orderOf = (day: string): number => DAY_ORDER.indexOf(day as (typeof DAY_ORDER)[number]);
  const rows: OpeningHoursRow[] = [];
  let i = 0;
  while (i < present.length) {
    const startDay = present[i];
    const time = timeFor(startDay);
    let j = i;
    // Extend the range while the next day is contiguous AND shares the same time.
    while (
      j + 1 < present.length &&
      orderOf(present[j + 1]) === orderOf(present[j]) + 1 &&
      timeFor(present[j + 1]) === time
    ) {
      j++;
    }
    const endDay = present[j];
    const label =
      startDay === endDay
        ? DAY_LABELS_AR[startDay]
        : `${DAY_LABELS_AR[startDay]} – ${DAY_LABELS_AR[endDay]}`;
    const isToday = present.slice(i, j + 1).includes(todayName);
    rows.push({ label, time, isToday });
    i = j + 1;
  }
  return rows;
}
