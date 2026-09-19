const MINOR_PER_MAJOR = 100;

/**
 * المبلغُ رقماً بلا عملة — لعمود الجدول وحده (خالد ١٨ سبتمبر ٢٠٢٦: «البلد معروفة»).
 * عمودُ السوق بجانبه يقول العملة، فتكرارُ «ج.م.» في كل صفّ يأكل عرضاً بلا معلومة.
 * نفسُ خانات `formatOrderMoney` (ar-EG · حتى كسرين) كي لا يختلف الرقم بين الشاشتين.
 */
const fmt = new Intl.NumberFormat("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function formatOrderAmount(amountMinor: number): string {
  return fmt.format(amountMinor / MINOR_PER_MAJOR);
}
