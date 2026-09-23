// نوعٌ لا قيمة: الملفّ يُستورد في مكوّنٍ عميل (`client-subscription-deal.tsx`)، واستيرادُ القيمة
// يجرّ `@prisma/client` إلى حزمة المتصفّح (٢٣ سبتمبر ٢٠٢٦).
import type { InvoicePaymentStatus } from "@prisma/client";
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
 * ── والفاتورةُ مستندٌ لا مال — أبداً ──
 * خالد (٢٣ سبتمبر ٢٠٢٦): «خلّي مصدر المعلومات مكاناً واحداً للأمور الماليّة». فسقطت قاعدةُ
 * «الفاتورة المسدَّدة بلا طلب تُعدّ مالاً» (`isStandaloneCollectedInvoice`): كانت تُبقي
 * مصدراً ثانياً حيّاً، فقال تقريرُ المبيعات «مصر ١١٨٬٧٠٣» وصفحةُ الطلبات «١١٥٬١٠٦» — والفرقُ
 * فاتورةٌ قديمةٌ واحدة (`MOD-2026-00015`) صدرت يدويّاً قبل نظام الطلبات. مالٌ لا طلبَ له
 * يُصحَّح بإنشاء طلبه، لا بعدّ ورقته. واليوم لا تُصدر فاتورةٌ إلّا من طلب (`orders/actions.ts`).
 *
 * ── والمستحقُّ من الفاتورة — قاعدةٌ واحدة (`isOutstandingInvoice`) ──
 * الفاتورةُ لا تُعدّ مالاً دخل، لكنّ غيرَ المدفوعة منها مطالبةٌ قائمة: هي وحدها تعريفُ «عليه».
 *
 * والمؤرشفةُ لاغية — تُستثنى في الاستعلام، لا هنا.
 */

export type CollectableOrder = { status: string };

export type CollectableInvoice = {
  orderId?: string | null;
  paymentStatus: InvoicePaymentStatus;
  fromOpeningBalance?: boolean | null;
};

/** الطلبُ مالٌ دخل ما دام `PAID` — والمستردُّ والملغى والمعلَّق ليست كذلك. */
export function isCollectedOrder(order: CollectableOrder): boolean {
  return order.status === "PAID";
}

/**
 * **المستحقّ — القاعدةُ الواحدة** (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد): فاتورةٌ صدرت ولم تُدفع.
 *
 * كان لـ«المستحقّ» ثلاثة تعريفات: هذا، وشرطٌ مكتوبٌ بيده في `get-payment-states.ts`، وتقريرُ
 * المبيعات يُسقط فواتيرَ الرصيد الافتتاحيّ ويقرأ `amount` — فلا يساوي مجموعُ كشوف الحساب
 * رقمَ التقرير. فلا استثناءَ هنا لرصيدٍ افتتاحيّ ولا لفاتورةٍ بلا طلب: الورقةُ غيرُ المدفوعة
 * دَينٌ حتى تُدفع أو تُؤرشف.
 *
 * والمؤرشفةُ تُستثنى في الاستعلام (`NOT_ARCHIVED`)، والمبلغُ من `invoiceMinor`، والجمعُ لكلّ
 * عملةٍ وحدها (`outstandingByCurrency`).
 */
export function isOutstandingInvoice(invoice: CollectableInvoice): boolean {
  return invoice.paymentStatus !== "PAID";
}

/** `totalMinor` هو الأدقّ (بالهللة)، و`amount` احتياطٌ للفواتير القديمة التي سبقته. */
export function invoiceMinor(invoice: { totalMinor?: number | null; amount: number }): number {
  return invoice.totalMinor ?? Math.round(invoice.amount * 100);
}

/**
 * المستحقّ **لكلّ عملة** بالوحدة الصغرى — ريالٌ لا يُجمع على جنيهٍ أبداً، ولا تُستعار عملةُ
 * أوّل فاتورةٍ لمجموعٍ مختلط (كان ذلك في جدول شرائح المال). مرتَّبٌ بالعملة ليثبت العرض.
 */
export function outstandingByCurrency(
  invoices: ReadonlyArray<CollectableInvoice & { currency: string; totalMinor?: number | null; amount: number }>,
): Array<{ currency: string; minor: number }> {
  const byCur = new Map<string, number>();
  for (const inv of invoices) {
    if (!isOutstandingInvoice(inv)) continue;
    byCur.set(inv.currency, (byCur.get(inv.currency) ?? 0) + invoiceMinor(inv));
  }
  return [...byCur.entries()]
    .map(([currency, minor]) => ({ currency, minor }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}
