import { db } from "@/lib/db";
import { addMonths } from "@/lib/invoices/add-months";
import { findBlockingUnpaidInvoice } from "@/lib/invoices/find-blocking-unpaid-invoice";

/**
 * ما ستحمله الفاتورةُ لو صدرت الآن — يُحسب بلا أيّ كتابة.
 *
 * نفسُ الدالّة تخدم المعاينةَ والإصدار (خالد ١٨ سبتمبر ٢٠٢٦: «إصدار الفاتورة بمودال
 * مرحلتين: بريفيو ثمّ تأكيد الإرسال»)، فما يُعرَض قبل الضغط هو ما يُكتب بعده حرفاً بحرف.
 * حسابٌ في مكانٍ وعرضٌ في مكانٍ آخر هو كيف تكذب شاشةُ المعاينة.
 */
export interface InvoicePlan {
  orderId: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  buyerEmail: string;
  tierName: string;
  period: "monthly" | "annual";
  currency: string;
  subtotalMinor: number;
  vatRateBp: number;
  vatMinor: number;
  totalMinor: number;
  paidMonths: number;
  bonusServiceMonths: number;
  /** فارغان حتّى يصل العميلَ أوّلُ مقال — فالمدّةُ لم تبدأ ولا يُخترع لها تاريخ. */
  subscriptionStart: Date | null;
  subscriptionEnd: Date | null;
  /**
   * أهذه الفاتورةُ توثيقٌ لدفعةٍ محسوبةٍ سلفاً، أم مالٌ جديد؟ تقريرُ المبيعات نقديُّ
   * الأساس ويعدّ أوّلَ طلبٍ مدفوعٍ لكلّ عميل إيراداً تأسيسيّاً، فالفاتورةُ الصادرةُ من
   * ذلك الطلب نفسِه تُوسَم كي لا يُعدّ المبلغُ مرّتين.
   */
  foundingInvoice: boolean;
}

export type InvoicePlanResult = { ok: true; plan: InvoicePlan } | { ok: false; error: string };

export async function planInvoiceFromOrder(orderId: string): Promise<InvoicePlanResult> {
  const order = await db.checkoutOrder.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, error: "الطلب غير موجود" };
  if (order.status !== "PAID") return { ok: false, error: "الطلب ليس مدفوعاً" };
  if (!order.clientId) return { ok: false, error: "أنشئ حساب العميل أولاً" };
  if (order.invoiceId) return { ok: false, error: "صدرت فاتورة لهذا الطلب مسبقاً" };
  /**
   * الصفرُ لا يُفوتَر.
   *
   * كان الطلبُ بصفرٍ يُخرج مستنداً مكتوباً عليه «فاتورة ضريبية · TAX INVOICE» بقيمة
   * ٠٫٠٠ ر.س. وضريبةٍ ٠٫٠٠ (مقيسٌ حيّاً ١٨ سبتمبر ٢٠٢٦ على طلبٍ سعوديٍّ بصفر). والفاتورةُ
   * الضريبيّة مستندُ توريدٍ بمقابل: لا مقابلَ فلا مستند — ولا رقمَ تسلسليّاً يُحرق عليه،
   * فالتسلسلُ يُدقَّق. والصفرُ عندنا اليوم علامةُ ترحيلٍ ناقصٍ لا هديّةٍ مقصودة: أربعةَ عشرَ
   * طلباً منها موسومٌ «⚠ ترحيلٌ يحتاج مراجعة».
   */
  if ((order.totalMinor ?? 0) <= 0) {
    return { ok: false, error: "الطلب بصفر — لا تُصدَر فاتورةٌ بلا مبلغ. صحّح مبلغ الطلب أوّلاً." };
  }

  const client = await db.client.findUnique({
    where: { id: order.clientId },
    select: { id: true, name: true, subscriptionEndDate: true, _count: { select: { invoices: true } } },
  });
  if (!client) return { ok: false, error: "العميل غير موجود" };

  const blocking = await findBlockingUnpaidInvoice(client.id);
  if (blocking) return { ok: false, error: `فيه فاتورة غير مسدّدة (${blocking}) لهذا العميل — حدّدها مدفوعة أو أرشفها أولاً` };

  const founding = await db.checkoutOrder.findFirst({
    where: { clientId: client.id, status: "PAID", totalMinor: { gt: 0 } },
    orderBy: [{ serviceStartedAt: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  /**
   * **فترةُ الفاتورة من الطلب نفسِه، لا من نهاية اشتراك العميل.**
   *
   * كانت المرساةُ `client.subscriptionEndDate` — ونهايةُ الاشتراك تُحسب لحظةَ التفعيل
   * فتصير «اليوم + مدّة الطلب». فتخرج فاتورةُ التأسيس واصفةً مدّةً تبدأ بعد انقضاء
   * الاشتراك كلِّه. مقيسٌ حيّاً ١٩ سبتمبر ٢٠٢٦ على `ORD-2026-00385`: طلبٌ سُجِّل اليوم
   * (١٢ شهراً + ٦ هديّة) خرجت فاتورتُه تقول «فترة الخدمة: ١٩ مارس ٢٠٢٨ — ١٨ سبتمبر ٢٠٢٩».
   *
   * والفاتورةُ مستندٌ عن **هذا الطلب**: تبدأ حيث بدأت خدمتُه (`serviceStartedAt`)، ثمّ
   * يومُ تفعيله، ثمّ يومُ دفعه — بهذا الترتيب، وكلُّها على الطلب لا على الكرت. فلا تتغيّر
   * فاتورةٌ صدرت لأنّ الكرتَ تغيّر بعدها، ولا يتداخل تجديدان في وصف مدّتهما.
   */
  /**
   * **وإن لم تبدأ الخدمةُ بعد، فلا تواريخَ أصلاً** (خالد ٢٠ سبتمبر ٢٠٢٦).
   *
   * قاعدةُ المدّة عندنا أنّها تبدأ **بأوّل مقالٍ يصل العميل** لا بيوم الدفع ولا بيوم
   * التفعيل — ولهذا `recompute-subscription-end.ts` يتجاهل الطلبَ الذي `serviceStartedAt`
   * فيه فارغ، وكرتُ العميل يبقى بلا تاريخ نهاية عن حقّ.
   *
   * وكانت الفاتورةُ تخالف ذلك: تسقط المرساةُ إلى `activatedAt` فتعلن مدّةً لم تبدأ.
   * مقيسٌ على `ORD-2026-00050` (عبير): لم يصلها مقالٌ بعد، وخرجت الفاتورة تقول
   * «بداية الاشتراك ٢٠ سبتمبر — نهاية الاشتراك ٢٠ ديسمبر». والكرتُ في نفس اللحظة
   * يقول إنّ الاشتراك لم يبدأ. مستندٌ يخالف النظام، ويصل العميلَ بتاريخٍ يحاسبنا عليه.
   *
   * فصارت الفاتورة تقول الحقيقة: المدّةُ معلومة، وبدايتُها معلَّقة على أوّل مقال.
   */
  const anchor = order.serviceStartedAt ?? null;
  return {
    ok: true,
    plan: {
      orderId: order.id,
      orderNumber: order.number,
      clientId: client.id,
      clientName: client.name,
      buyerEmail: order.buyerEmail,
      // اسمُ الباقة من الطلب أوّلاً: هو ما دفع عليه العميل، لا ما يقوله كرتُه اليوم.
      // الطلبُ يحمل اسمَ باقته — والجدولُ القديم سقط احتياطيّاً (١٩ سبتمبر ٢٠٢٦).
      tierName: order.planName || "—",
      period: order.paidMonths === 1 ? "monthly" : "annual",
      currency: order.currency,
      subtotalMinor: order.subtotalMinor,
      vatRateBp: order.vatRateBp,
      vatMinor: order.vatMinor,
      totalMinor: order.totalMinor,
      paidMonths: order.paidMonths,
      bonusServiceMonths: order.bonusServiceMonths,
      subscriptionStart: anchor,
      subscriptionEnd: anchor ? addMonths(anchor, order.paidMonths + order.bonusServiceMonths) : null,
      foundingInvoice: founding?.id === order.id && client._count.invoices === 0,
    },
  };
}
