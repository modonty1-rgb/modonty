/**
 * **ما دفعه العميل — قاعدةٌ واحدة لكلّ شاشة** (خالد ٢٣ سبتمبر ٢٠٢٦).
 *
 * كان «كم دفع العميل» يُحسب من أربعة مصادر: كرتُ الطلب من الفواتير المسدَّدة، وكشفُ
 * الحساب من إيصالات البوّابة، وتقريرُ المبيعات من «أوّل طلب» + الفواتير، والكونسول من
 * الفواتير. فتقول شاشتان عن نفس العميل رقمين. مقيسٌ على `ORD-2026-00582`: الطلبُ
 * «٢٬٣٩٤ مدفوع» وكشفُه «المستلم ٠» — لأنّ إيصالَ الترحيل كُتب بصفرٍ ثمّ عُدّل الطلب.
 *
 * ── المصدرُ هو الطلب ──
 * الطلبُ `PAID` بمبلغه هو ما دخل. والإيصالُ سجلُّ بوّابةٍ لا دفتر: الطلبُ اليدويّ لا
 * إيصالَ له، وتعديلُ المبلغ لا يلمسه، والاستردادُ يتركه «ناجحاً». والطلبُ `REFUNDED`
 * خارجٌ من المدفوع تلقائيّاً، فلا حسابَ ثانٍ يُطرح منه.
 *
 * ── والفاتورةُ تُعدّ حين لا طلبَ يحملها ──
 * فاتورةٌ صدرت من طلبٍ مستندٌ عنه لا مالٌ ثانٍ، وعدُّهما معاً يضاعف المبلغ. فتُعدّ
 * الفاتورةُ المسدَّدةُ التي **بلا طلب** وحدها (تجديداتٌ قديمة فُوترت يدويّاً). وفاتورةُ
 * الرصيد الافتتاحيّ (`fromOpeningBalance`) توثّق مبلغاً يحمله طلبُ الترحيل، فلا تُعدّ.
 *
 * والمؤرشفةُ لاغية — تُستثنى في الاستعلام، لا هنا.
 */

export type CollectableOrder = { status: string };

export type CollectableInvoice = {
  orderId?: string | null;
  paymentStatus: string;
  fromOpeningBalance?: boolean | null;
};

/** الطلبُ مالٌ دخل ما دام `PAID` — والمستردُّ والملغى والمعلَّق ليست كذلك. */
export function isCollectedOrder(order: CollectableOrder): boolean {
  return order.status === "PAID";
}

/** فاتورةٌ مسدَّدةٌ لا يحمل مالَها طلبٌ ولا رصيدٌ افتتاحيّ. */
export function isStandaloneCollectedInvoice(invoice: CollectableInvoice): boolean {
  return invoice.paymentStatus === "PAID" && !invoice.orderId && !invoice.fromOpeningBalance;
}

/** دَينٌ على العميل: فاتورةٌ صدرت ولم تُسدَّد. */
export function isOutstandingInvoice(invoice: CollectableInvoice): boolean {
  return invoice.paymentStatus !== "PAID";
}

/** `totalMinor` هو الأدقّ (بالهللة)، و`amount` احتياطٌ للفواتير القديمة التي سبقته. */
export function invoiceMinor(invoice: { totalMinor?: number | null; amount: number }): number {
  return invoice.totalMinor ?? Math.round(invoice.amount * 100);
}
