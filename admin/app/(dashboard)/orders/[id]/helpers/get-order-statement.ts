import { db } from "@/lib/db";

/**
 * كشفُ حساب العميل مختصراً — على كرت الطلب (خالد ١٨ سبتمبر ٢٠٢٦).
 *
 * ثلاثة أسئلةٍ يسألها من يفتح طلباً: كم دُفع وكم بقي · كم مقالاً اتُّفق عليه وكم بقي منه
 * · وأين نحن من مدّة الاشتراك. وكانت إجاباتُها في ثلاث شاشات.
 *
 * **يُحسب ولا يُخزَّن:** الفواتير تقول المال، والمقالات تقول التسليم، والطلبُ يقول
 * المتّفق عليه. أيُّ رقمٍ يُخزَّن هنا يكذب أوّلَ ما تُصدَر فاتورةٌ أو يُنشر مقال.
 */
export interface OrderStatement {
  currency: string;
  /** مجموعُ الفواتير المسدَّدة — المالُ الذي دخل فعلاً. */
  paidMinor: number;
  /** فواتيرُ صدرت ولم تُسدَّد — دَينٌ على العميل. */
  dueMinor: number;
  invoiceCount: number;
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
  const [invoices, delivered] = await Promise.all([
    // المؤرشفةُ لاغية: تبقى في الدفتر للسجلّ ولا تطالب بشيء.
    db.invoice.findMany({
      where: { clientId, OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }] },
      select: { totalMinor: true, amount: true, paymentStatus: true },
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

  // `totalMinor` هو الأدقّ (بالهللة)، و`amount` احتياطٌ للفواتير القديمة التي سبقته.
  const minor = (i: { totalMinor: number | null; amount: number }) => i.totalMinor ?? Math.round(i.amount * 100);
  const serviceMonths = order.paidMonths + order.bonusServiceMonths;

  return {
    currency: order.currency,
    paidMinor: invoices.filter((i) => i.paymentStatus === "PAID").reduce((s, i) => s + minor(i), 0),
    dueMinor: invoices.filter((i) => i.paymentStatus !== "PAID").reduce((s, i) => s + minor(i), 0),
    invoiceCount: invoices.length,
    articlesAgreed: order.articlesPerMonth != null ? order.articlesPerMonth * serviceMonths : null,
    articlesDelivered: delivered,
    articlesPerMonth: order.articlesPerMonth,
    serviceMonths,
  };
}
