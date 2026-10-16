/** Saudi time has no daylight saving — the offset is a constant, not a lookup. */
const RIYADH_OFFSET_HOURS = 3;

/**
 * A task written at or after this hour (Riyadh) is planning for the NEXT working day.
 * Measured on prod, 8 weeks of tasks people wrote for themselves: writing runs 07–16
 * (16 tasks at 16:00) and drops at 17:00 (6), then a thin evening tail.
 */
export const WORKDAY_CUTOFF_HOUR = 17;

/** HH:00 Riyadh on calendar day y/m/d — `Date.UTC` rolls a negative day back across months. */
function riyadhAt(y: number, m: number, d: number, hour: number): Date {
  return new Date(Date.UTC(y, m, d, hour - RIYADH_OFFSET_HOURS));
}

/**
 * Today in Riyadh, as a Date whose LOCAL y/m/d are Riyadh's — the shape the report pages pass
 * around. `new Date()` on Vercel is UTC, which is still "yesterday" until 03:00 Riyadh.
 */
export function riyadhToday(now: Date = new Date()): Date {
  const r = new Date(now.getTime() + RIYADH_OFFSET_HOURS * 3_600_000);
  return new Date(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate());
}

/**
 * **مهامّ يوم العمل `day` = ما كُتب من ٥ عصر يوم العمل السابق إلى ٥ عصر هذا اليوم** (بتوقيت الرياض).
 *
 * خالد (١٦ أكتوبر ٢٠٢٦): «لمّا الموظف يسوّي التاسكات تبعته بالليل تبع بكرة… اليوم الثاني ما ألاقيها».
 * كان اليوم = يوم الكتابة (`createdAt` من منتصف الليل)، فمهمّةٌ كُتبت الليلة لبكرة تُحسب على الليلة،
 * وتقرير بكرة لا يراها — وتذكير ٨:٠٠ يعدّ كاتبها «لم يكتب».
 *
 * الأحد يبدأ من ٥ عصر الخميس: الجمعة والسبت إجازة، فما كُتب فيهما لأحدٍ قادم.
 * `day` يُقرأ بمكوّناته المحلّيّة (y/m/d) — نفس شكل `?date=` في صفحة التقرير.
 */
export function workDayWindow(day: Date): { from: Date; to: Date } {
  const y = day.getFullYear();
  const m = day.getMonth();
  const d = day.getDate();
  const weekday = new Date(Date.UTC(y, m, d)).getUTCDay(); // 0 = Sunday
  const back = weekday === 0 ? 3 : 1;
  return { from: riyadhAt(y, m, d - back, WORKDAY_CUTOFF_HOUR), to: riyadhAt(y, m, d, WORKDAY_CUTOFF_HOUR) };
}
