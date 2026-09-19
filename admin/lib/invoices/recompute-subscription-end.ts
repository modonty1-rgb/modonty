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
      where: { clientId, status: "PAID", NOT: [{ serviceStartedAt: null }] },
      select: { serviceStartedAt: true, paidMonths: true, bonusServiceMonths: true },
      take: 200,
    }),
    db.invoice.findMany({ where: { clientId, ...NOT_ARCHIVED }, select: { subscriptionEnd: true }, take: 500 }),
  ]);

  /**
   * نهايةُ دورةٍ واحدة: **بدايةُ الخدمة** + الشهور المدفوعة + شهور الهديّة.
   *
   * خالد (١٩ سبتمبر ٢٠٢٦): «المدّة تبدأ بعد أوّل أرتيكل». وبدايةُ الخدمة تُختم عند
   * وصول أوّل مقالٍ للعميل (`lib/orders/start-service-clock.ts`)، لا يوم التفعيل:
   * مدّةُ التجهيز بعد الدفع شغلُنا نحن لا خدمتُه هو.
   *
   * وطلبٌ لم تبدأ خدمتُه بعدُ لا نهايةَ له — وهذا صحيحٌ لا نقص: لا يُطالَب بتجديدِ
   * مدّةٍ لم تبدأ.
   */
  const endOf = (o: { serviceStartedAt: Date | null; paidMonths: number; bonusServiceMonths: number }): Date | null => {
    if (!o.serviceStartedAt) return null;
    const e = new Date(o.serviceStartedAt);
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
