import { db } from "@/lib/db";
import { NOT_ARCHIVED } from "./not-archived";

/**
 * الصيغةُ الواحدة التي تقرّر إلى متى يمتدّ اشتراكُ العميل.
 *
 * **مصدرُها الطلب، لا الفاتورة** (خالد ١٨ سبتمبر ٢٠٢٦). الطلبُ هو العقد: مدّةٌ اشتُريت
 * بدأت يوم التفعيل؛ والفاتورةُ مستندٌ يوثّقه وقد لا يصدر أصلاً. وحساب المدّة من مستندٍ
 * اختياريّ يعني أنّ الاشتراك «ينتهي» متى نُسي إصدارُ ورقة.
 *
 * **ما كشفه القياس (١٨ سبتمبر ٢٠٢٦):** انقسامٌ تامّ — الأدمنُ يحسب من الطلب والكونسولُ
 * يقرأ هذا الحقل المحسوب من الفواتير، فكان التطابق **صفراً من ٤٢**: ١٩ عميلاً يختلفون
 * بفروقٍ تبلغ ٣٢٦ يوماً، و٢٣ بلا تاريخٍ أصلاً لأنّ فواتيرهم لم تصدر. فيرى العميلُ في
 * بوّابته «ينتهي أكتوبر ٢٠٢٧» والأدمنُ يقول «انتهى».
 *
 * **والتاريخُ لا يرجع للخلف إلّا بقرار:** يُؤخذ أبعدُ انتهاءٍ بين طلبات العميل المدفوعة،
 * فتجديدٌ يمدّه ولا يقصّره. وكان الحسابُ من الفواتير يرتدّ فعلاً: تسديدُ أقدمِ فاتورةٍ
 * معلَّقة كان يعيد التاريخ إلى الوراء فيخسر العميلُ شهوراً (وقع على «فرسان التعافي»
 * ٢٤ يوليو: ٢٠٢٧-٠٥-٢٤ كانت ستنهار إلى ٢٠٢٦-١٠-٢٤).
 *
 * والفاتورةُ تبقى مرجعاً احتياطيّاً للعملاء القدامى الذين لا طلبَ لهم — سطرٌ في دفترٍ
 * بلا عقدٍ خلفه خيرٌ من لا شيء.
 */
export async function recomputeSubscriptionEnd(clientId: string): Promise<Date | null> {
  const [orders, invoices] = await Promise.all([
    db.checkoutOrder.findMany({
      where: { clientId, status: "PAID", NOT: [{ activatedAt: null }] },
      select: { activatedAt: true, paidMonths: true, bonusServiceMonths: true },
      take: 200,
    }),
    db.invoice.findMany({ where: { clientId, ...NOT_ARCHIVED }, select: { subscriptionEnd: true }, take: 500 }),
  ]);

  /** نهايةُ دورةٍ واحدة: يومُ التفعيل + الشهور المدفوعة + شهور الهديّة. */
  const endOf = (o: { activatedAt: Date | null; paidMonths: number; bonusServiceMonths: number }): Date | null => {
    if (!o.activatedAt) return null;
    const e = new Date(o.activatedAt);
    e.setMonth(e.getMonth() + o.paidMonths + o.bonusServiceMonths);
    return e;
  };

  const furthest = (dates: (Date | null)[]): Date | null =>
    dates.filter((d): d is Date => d instanceof Date).reduce<Date | null>((max, d) => (max === null || d > max ? d : max), null);

  // الطلباتُ أوّلاً؛ وبلا طلبٍ مفعَّل تُقرأ الفواتير — عميلٌ قديمٌ سبق نظامَ الطلبات.
  const latestEnd = furthest(orders.map(endOf)) ?? furthest(invoices.map((i) => i.subscriptionEnd));

  // `null` يُكتب كما هو: تاريخٌ باقٍ بلا عقدٍ ولا فاتورةٍ تبرّره هو رقمٌ يكذب.
  await db.client.update({ where: { id: clientId }, data: { subscriptionEndDate: latestEnd } });
  return latestEnd;
}
