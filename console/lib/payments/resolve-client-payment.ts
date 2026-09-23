import { isCollectedOrder } from "@modonty/shared/lib/payments/collected";

/**
 * **حالةُ دفع العميل كما يراها في بوّابته — قاعدةٌ واحدة** (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
 *
 * كانت الإعداداتُ والشريطُ الجانبيّ ولوحةُ البداية تحسبها كلٌّ بيده من «هل توجد فاتورةٌ غيرُ
 * مدفوعة؟» — فرأى «مدفوع» عميلٌ بلا طلبٍ أصلاً، وعميلٌ استُردّ مالُه. الآن من الطلب الساري:
 *   فاتورةٌ قائمة ← عليك مستحقّات (تتقدّم) · الطلبُ `PAID` ← مدفوع ·
 *   `REFUNDED` ← مسترد · لا طلبَ ساري ← لا شارة.
 */
export type ClientPaymentKey = "OWES" | "PAID" | "REFUNDED" | "NONE";

export function resolveClientPayment(
  activeOrder: { status: string } | null,
  outstandingCount: number,
): ClientPaymentKey {
  if (outstandingCount > 0) return "OWES";
  if (!activeOrder) return "NONE";
  if (isCollectedOrder(activeOrder)) return "PAID";
  if (activeOrder.status === "REFUNDED") return "REFUNDED";
  return "NONE";
}
