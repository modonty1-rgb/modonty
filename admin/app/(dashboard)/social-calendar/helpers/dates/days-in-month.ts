/**
 * أيام الشهر الحقيقية من التقويم نفسه — فبراير ٢٩ في السنة الكبيسة.
 * يصلح باگ القديم (`DAYS_IN_MONTH.feb = 28` دائماً).
 */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}
