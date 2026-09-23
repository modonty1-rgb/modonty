import { db } from "@/lib/db";
import {
  invoiceMinor,
  isCollectedOrder,
  isOutstandingInvoice,
} from "@modonty/shared/lib/payments/collected";

/**
 * كشفُ حساب العميل مختصراً — على كرت الطلب (خالد ١٨ سبتمبر ٢٠٢٦).
 *
 * ثلاثة أسئلةٍ يسألها من يفتح طلباً: كم دُفع وكم بقي · كم مقالاً اتُّفق عليه وكم بقي منه
 * · وأين نحن من مدّة الاشتراك. وكانت إجاباتُها في ثلاث شاشات.
 *
 * **يُحسب ولا يُخزَّن:** الطلباتُ المدفوعة تقول المال (بقاعدة `collected.ts` نفسِها
 * التي يقرؤها كشفُ الحساب وتقريرُ المبيعات)، والفواتيرُ تقول الدَّين، والمقالاتُ تقول
 * التسليم. أيُّ رقمٍ يُخزَّن هنا يكذب أوّلَ ما تُصدَر فاتورةٌ أو يُنشر مقال.
 */
export interface OrderStatement {
  currency: string;
  /** الطلباتُ المدفوعة وحدها — المالُ الذي دخل فعلاً. والفاتورةُ مستندٌ لا مال. */
  paidMinor: number;
  /** عددُ الطلبات المدفوعة التي جُمع منها `paidMinor` — لا عددُ الفواتير. */
  paidOrderCount: number;
  /** فواتيرُ لم تُدفع (`isOutstandingInvoice`) — دَينٌ على العميل. */
  dueMinor: number;
  /** حصّةُ المقالات المتَّفق عليها = الشهريّة × شهور الخدمة. `null` حين لا حصّة على الطلب. */
  articlesAgreed: number | null;
  /** ما سُلِّم فعلاً — المنشورُ لهذا العميل منذ بداية خدمته. */
  articlesDelivered: number;
  articlesPerMonth: number | null;
  serviceMonths: number;
}

export async function getOrderStatement(
  clientId: string,
  order: { articlesPerMonth: number | null; paidMonths: number; bonusServiceMonths: number; currency: string; serviceStartedAt: Date | null },
): Promise<OrderStatement> {
  const [orders, invoices, delivered] = await Promise.all([
    db.checkoutOrder.findMany({
      where: { clientId, currency: order.currency },
      select: { status: true, totalMinor: true },
    }),
    // المؤرشفةُ لاغية: تبقى في الدفتر للسجلّ ولا تطالب بشيء.
    db.invoice.findMany({
      where: { clientId, currency: order.currency, OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }] },
      select: { totalMinor: true, amount: true, paymentStatus: true, orderId: true, fromOpeningBalance: true },
    }),
    /**
     * المنشورُ منذ بداية الخدمة — لا عمرُ العميل كلُّه: الحصّةُ تخصّ هذه الدورة، فعدُّ
     * مقالات دورةٍ سابقة فيها يجعل المتبقّي سالباً بلا ذنب.
     */
    db.article.count({
      where: {
        clientId,
        status: { in: ["PUBLISHED", "PUBLISHED_ON_CLIENT_SITE"] },
        ...(order.serviceStartedAt ? { datePublished: { gte: order.serviceStartedAt } } : {}),
      },
    }),
  ]);

  const serviceMonths = order.paidMonths + order.bonusServiceMonths;
  // الطلباتُ المدفوعة وحدها — الفاتورةُ مستندٌ لا مال (مصدرٌ واحد، ٢٣ سبتمبر ٢٠٢٦).
  const collected = orders.filter(isCollectedOrder);

  return {
    currency: order.currency,
    paidMinor: collected.reduce((s, o) => s + o.totalMinor, 0),
    paidOrderCount: collected.length,
    dueMinor: invoices.filter(isOutstandingInvoice).reduce((s, i) => s + invoiceMinor(i), 0),
    articlesAgreed: order.articlesPerMonth != null ? order.articlesPerMonth * serviceMonths : null,
    articlesDelivered: delivered,
    articlesPerMonth: order.articlesPerMonth,
    serviceMonths,
  };
}
