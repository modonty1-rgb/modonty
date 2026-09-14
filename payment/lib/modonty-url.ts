/**
 * رابطٌ إلى صفحةٍ في **مدونتي** من داخل تطبيق الدفع.
 *
 * لماذا وُجد (PAY-C4، ١٤ سبتمبر ٢٠٢٦): كانت الروابط تُكتب نسبيّةً — `/terms` و
 * `/refund-policy` و`/` — لأن الدفع كان يعيش داخل مدونتي. وبعد الفصل صارت تشير إلى
 * تطبيق الدفع نفسه، فتردّ ٤٠٤ على مشترٍ يُطلب منه أن يوافق على الشروط قبل أن يدفع.
 *
 * والقيمة الاحتياطية هنا مقبولة — بخلاف `payPublicUrl()`: هذا رابطُ محتوىً عامّ، وخطؤه
 * يُظهر صفحةً خاطئة ولا يخسر مالاً.
 */
const MODONTY_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.modonty.com").replace(/\/+$/, "");

export function modontyUrl(path: string): string {
  return `${MODONTY_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
