/**
 * `failedReason` الخام → جملةٌ يقرأها موظّف المبيعات (خالد ١٦ سبتمبر ٢٠٢٦:
 * «أعطني سبباً منطقياً أنا كإنسان أعرف أقرأه»).
 *
 * الحقل يحمل ما رجع من المزوّد حرفياً — `N-Genius hosted-session payment failed: 404
 * {"message":"Not Found","code":404,...}` — وهذا نصٌّ لمن يصحّح الكود، لا لمن يردّ على
 * عميلٍ يسأل «ليش ما نجح الدفع؟».
 *
 * والمقابلة أدناه مبنيّة على **ما هو مخزَّن فعلاً** في القاعدة لا على احتمالات: قياس
 * ١٦ سبتمبر ٢٠٢٦ أعطى أربع قيمٍ مميّزة في ٣٠ طلباً فاشلاً، ورموز `PaymentAttempt`
 * أعطت `DO_NOT_HONOR` · `INSUFFICIENT_FUNDS` · `FOREIGN_CARD` · `SESSION_EXPIRED`.
 * ما لا يُطابق يرجع بالجملة العامّة — ولا يُخفى النصّ الخام أبداً، فالشاشة تعرضه كاملاً
 * تحت الجملة: من يريد الجملة يقرؤها، ومن يريد التشخيص يجده.
 */

export interface HumanFailureReason {
  /** الجملة القصيرة — ماذا حدث. */
  title: string;
  /** ماذا يعني ذلك لمن يقرأ، وما الخطوة إن وُجدت. */
  detail: string;
  /**
   * هل العطل عندنا لا عند العميل؟ يغيّر نبرة الشاشة: عطلنا يُصلَح ولا يُطلب من
   * العميل شيء؛ ورفضُ البنك يُقال للعميل ليعيد المحاولة ببطاقةٍ أخرى.
   */
  ours: boolean;
}

/** علامةٌ في النصّ الخام ← الجملة. تُفحص بالترتيب، وأوّل تطابقٍ يفوز. */
const SIGNALS: Array<{ match: RegExp; reason: HumanFailureReason }> = [
  {
    // ٤ طلبات: مفتاح البوابة غائبٌ عن البيئة — الدفع لم يبدأ أصلاً.
    match: /_KEY is not set|_SECRET is not set|not configured/i,
    reason: {
      title: "بوابة الدفع غير مضبوطة عندنا",
      detail: "مفتاح البوابة ناقص في الإعدادات، فلم تبدأ عملية الدفع. العميل لم يُخصم منه شيء — يُصلَح الإعداد ثم يُعاد إرسال رابط الدفع.",
      ours: true,
    },
  },
  {
    // ١ طلب: رابط العودة من البوابة مرفوض — إعدادٌ عندنا كذلك.
    match: /Invalid redirect url|invalid.?redirect/i,
    reason: {
      title: "رابط العودة من البوابة مرفوض",
      detail: "البوابة رفضت العنوان الذي نعيد إليه العميل بعد الدفع. عطلٌ في إعدادنا لا في بطاقة العميل.",
      ours: true,
    },
  },
  {
    // ٢٤ طلباً + ١ بالعربية: الجلسة انتهت قبل أن يُكمل العميل.
    match: /session ID has either expired|invalidSessionId|invalidSession|SESSION_EXPIRED|انتهت مهلة الجلسة/i,
    reason: {
      title: "انتهت صلاحية صفحة الدفع قبل أن يُكملها العميل",
      detail: "فتح العميل صفحة الدفع وتركها حتى انتهت مهلتها. لم يُخصم أي مبلغ — يُرسَل له رابط دفعٍ جديد.",
      ours: false,
    },
  },
  {
    match: /INSUFFICIENT_FUNDS|insufficient funds/i,
    reason: {
      title: "رصيد البطاقة لا يكفي",
      detail: "رفض البنك العملية لعدم كفاية الرصيد. لم يُخصم شيء — يعيد العميل المحاولة ببطاقةٍ أخرى.",
      ours: false,
    },
  },
  {
    match: /DO_NOT_HONOR|do not honor/i,
    reason: {
      title: "بنك العميل رفض العملية",
      detail: "رفضٌ من البنك بلا سببٍ معلن — غالباً حدُّ شراءٍ إلكترونيّ أو حمايةٌ على البطاقة. يتواصل العميل مع بنكه، أو يجرّب بطاقةً أخرى.",
      ours: false,
    },
  },
  {
    match: /FOREIGN_CARD|foreign card/i,
    reason: {
      title: "بطاقة صادرة خارج السوق",
      detail: "البوابة لا تقبل هذه البطاقة في هذا السوق. يُدفع ببطاقةٍ محلّية، أو بتحويلٍ بنكيّ.",
      ours: false,
    },
  },
  {
    match: /expired card|card_expired|EXPIRED_CARD/i,
    reason: {
      title: "البطاقة منتهية الصلاحية",
      detail: "تاريخ انتهاء البطاقة مضى. يعيد العميل المحاولة ببطاقةٍ سارية.",
      ours: false,
    },
  },
  {
    match: /3D ?Secure|authentication.?failed|OTP/i,
    reason: {
      title: "لم يكتمل التحقّق من البنك",
      detail: "لم يُدخَل رمز التحقّق، أو انتهت مهلته. لم يُخصم شيء — يُعاد الدفع ويُدخَل الرمز في وقته.",
      ours: false,
    },
  },
  {
    match: /cancell?ed|أُلغيت|ألغى/i,
    reason: {
      title: "أُلغيت العملية",
      detail: "خرج العميل من صفحة الدفع قبل إتمامها. لم يُخصم أي مبلغ.",
      ours: false,
    },
  },
];

const FALLBACK: HumanFailureReason = {
  title: "لم يكتمل الدفع",
  detail: "رجع من البوابة سببٌ لا نعرف ترجمته بعد — النصّ الخام تحته كما وصل.",
  ours: false,
};

export function humanFailureReason(raw: string | null | undefined): HumanFailureReason | null {
  if (!raw?.trim()) return null;
  return SIGNALS.find((signal) => signal.match.test(raw))?.reason ?? FALLBACK;
}
