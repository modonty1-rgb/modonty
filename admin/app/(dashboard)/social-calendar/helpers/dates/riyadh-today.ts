import { RIYADH_OFFSET_MINUTES } from "./month-labels";

/** «اليوم» بتوقيت الرياض — يحدّد اليوم المميَّز في الجدول واليوم الافتراضي للمنشور الجديد. */
export function riyadhToday(now: Date = new Date()): { year: number; month: number; day: number } {
  const shifted = new Date(now.getTime() + RIYADH_OFFSET_MINUTES * 60_000);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth(), day: shifted.getUTCDate() };
}
