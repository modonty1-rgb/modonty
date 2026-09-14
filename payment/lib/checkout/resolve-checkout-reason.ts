/**
 * رمز فشل الدفع → جملةٌ يفهمها المشتري (منقول من جبر سيو `lib/checkout-reasons.ts`).
 *
 * يُقرأ في موضعين: شريطٌ داخل صفحة الدفع لإعادة المحاولة، وصفحة `failed` كاملة.
 *
 * ما يميّزه أن كل سببٍ يحمل **هل يُعاد المحاولة في مكانها**. رفضُ بنكٍ عابر يُعالَج بشريط
 * وإعادة إدخال بطاقة؛ وشبهةُ احتيالٍ أو عطلٌ عندنا يُخرج المشتري إلى صفحةٍ فيها مخرج
 * بشريّ. الخلط بينهما يصنع حلقةً: مشترٍ يعيد ويعيد على سببٍ لن يتغيّر.
 *
 * وكل نصّ يقول «لم يُخصم أي مبلغ» حيث يصحّ — أوّل سؤالٍ في ذهن من فشلت بطاقته.
 */

export type FailureReason = {
  title: string;
  hint: string;
  /** true ⇒ شريطٌ وإعادة محاولة في الصفحة · false ⇒ إخراجٌ إلى `failed` بمخرج دعم. */
  recoverable: boolean;
};

const CHECKOUT_REASONS: Record<string, FailureReason> = {
  card_declined:         { title: "البطاقة مرفوضة من البنك",     hint: "جرّب بطاقة أخرى أو تواصل مع بنكك للتحقق من التصريح",              recoverable: true },
  insufficient_funds:    { title: "الرصيد غير كافٍ",              hint: "تحقق من رصيد البطاقة أو جرّب بطاقة ثانية",                       recoverable: true },
  card_expired:          { title: "البطاقة منتهية الصلاحية",       hint: "استخدم بطاقة سارية",                                            recoverable: true },
  authentication_failed: { title: "فشل التحقق (OTP / 3D Secure)",  hint: "تأكد من إدخال رمز التحقق الصحيح · قد تكون صلاحيته انتهت",        recoverable: true },
  invalid_card:          { title: "بيانات البطاقة غير صحيحة",      hint: "تأكد من رقم البطاقة، تاريخ الانتهاء، ورمز CVV",                  recoverable: true },
  cancelled_by_user:     { title: "أُلغيت العملية",                hint: "لم يُخصم أي مبلغ. يمكنك المحاولة مرة أخرى",                      recoverable: true },
  timeout:               { title: "انتهت مهلة الدفع",              hint: "لم يكتمل التحقق في الوقت المطلوب. أعد المحاولة",                 recoverable: true },
  fraud_suspected:       { title: "تم إيقاف العملية لأسباب أمنية", hint: "لحمايتك، البنك أوقف هذه العملية. تواصل مع بنكك أو معنا",         recoverable: false },
  network_error:         { title: "خطأ في الاتصال",               hint: "أعد المحاولة بعد التأكد من اتصالك بالإنترنت",                   recoverable: false },
  system_error:          { title: "خطأ تقني عندنا",               hint: "المشكلة من عندنا، مو منك. تواصل مع الدعم — نساعدك فوراً",        recoverable: false },
};

export const DEFAULT_REASON: FailureReason = {
  title: "لم يكتمل الدفع",
  hint: "لم يُخصم أي مبلغ من بطاقتك. يمكنك إعادة المحاولة",
  recoverable: true,
};

/**
 * بعد هذا العدد من المحاولات الفاشلة يُخرَج المشتري إلى `failed` ولو كان السبب قابلاً
 * للإعادة — مخرجٌ بشريّ بدل حلقةٍ لا تنتهي.
 */
export const MAX_INLINE_RETRIES = 3;

export function resolveCheckoutReason(code: string | null | undefined): FailureReason {
  if (!code) return DEFAULT_REASON;
  return CHECKOUT_REASONS[code.trim().toLowerCase()] ?? DEFAULT_REASON;
}
