/**
 * «YYYY-MM-DD» من النموذج → `scheduledFor` (منتصف ليل UTC). يرفض التواريخ التي يدوّرها
 * `Date` بصمت (٣٠ فبراير يصير ٢ مارس) — يوم غير موجود = null.
 */
export function parseDayInput(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(Date.UTC(year, month, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month || d.getUTCDate() !== day) return null;
  if (year < 2020 || year > 2100) return null;
  return d;
}
