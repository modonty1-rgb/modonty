import { MONTHS, formatCounted } from "./arabic-count";

/**
 * تصريف «شهر» مع العدد: ١ شهر · شهران · ٣–١٠ أشهر · ١١+ شهراً.
 *
 * يفوّض إلى `formatCounted` منذ ١٣ سبتمبر ٢٠٢٦: القاعدة نفسها لزمت «مقال» أيضاً
 * (`PAY-G7`)، فرُفعت إلى `arabic-count.ts` ولم تُنسخ. هذا الملفّ يبقى لأن المستدعين
 * كثر ولأن «الأشهر» هي الاسم الأكثر وروداً في مسار البيع.
 */
export function formatMonths(n: number): string {
  return formatCounted(n, MONTHS);
}
