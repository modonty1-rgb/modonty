/**
 * العنوان العامّ لتطبيق الدفع — يُبنى منه كل رابطٍ يعود إليه من الخارج:
 * تحويل المشتري بعد 3DS · عودة تمارا · وعنوان الإشعار (الويبهوك).
 *
 * ⚠ لماذا لا `NEXT_PUBLIC_SITE_URL`: كان هو المستعمل قبل الفصل لأن الدفع كان يعيش داخل
 * مدونتي. وبعد `PAY-S3` صار تطبيقاً على نطاقه، فبقاؤه يعني أن البوّابة تعيد المشتري إلى
 * `modonty.com/pay/…` — وهو مسارٌ لم يعد موجوداً هناك (٤٠٤)، بعد أن تُخصم البطاقة.
 * وأسوأ منه: عنوان إشعار تمارا كان سيذهب إلى مدونتي، فلا يصل تأكيد الدفع أبداً ويبقى
 * الطلب `AWAITING_PAYMENT` وقد دُفع.
 *
 * ولا قيمة احتياطية في الإنتاج عمداً: عنوانٌ خاطئ هنا يخسر مالاً بصمت، وخطأٌ عند إنشاء
 * الطلب يُرى ويُصلَح في دقيقة. محليّاً يسقط على منفذ التطوير.
 */
export function payPublicUrl(): string {
  const configured = process.env.PAY_PUBLIC_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "development") return "http://localhost:3003";
  throw new Error(
    "PAY_PUBLIC_URL is not set — payment return and webhook URLs cannot be built. " +
      "Set it in the payment app environment (e.g. https://pay.modonty.com).",
  );
}
