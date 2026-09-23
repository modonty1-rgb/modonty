import { currencyLabel } from "@modonty/shared/lib/commercial/format-money";

/**
 * الفانل الحقيقي — لا ثلاثة صناديق.
 *
 * كان `محتمل · نشط · مؤرشف`، وهذه حالات تخزين لا مراحل بيع: لا تقول أين وقف الكلام، ولا
 * كم بقي على القفل، ولا لماذا سقط مَن سقط. الست مراحل أدناه هي ما تقوله المندوبة بلسانها
 * حين تُسأل «وصلت لفين معاه؟».
 *
 * `WON` لا يُختار بيد — يُكتب لحظة التحويل إلى عميل، ومصدره `convertedClientId`. حالةٌ تُختار
 * يدوياً بينما يقرّرها فعلٌ آخر تصير مصدر حقيقة ثانياً يخالف الأول.
 */
export const STAGES = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATING", "WON", "LOST"] as const;
export type Stage = (typeof STAGES)[number];

/** المراحل التي تُختار بيد المندوبة — بلا `WON` (يقرّره التحويل) ولا `LOST` (له حواره). */
export const PICKABLE_STAGES = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATING"] as const;

export const STAGE_LABEL: Record<Stage, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  QUOTED: "عرض سعر مُرسل",
  NEGOTIATING: "تفاوض",
  WON: "تم الإغلاق",
  LOST: "خسارة",
};

/**
 * اللون يتدرّج مع المشوار: رماديّ في أوّله، كهرمانيّ حين يسخن، أخضر حين يُقفل، وأحمر باهت
 * حين يسقط. فتُقرأ القائمة كخريطة حرارة بلا أن تُقرأ كلمةً كلمة.
 *
 * **الدرجة `700` في الفاتح لا `600`** — مقيسةً على الأبيض (٥ سبتمبر): `sky-600 4.1` ·
 * `amber-600 3.19` · `orange-600 3.56` · `emerald-600 3.77`، وكلّها تحت عتبة `4.5` والنصّ
 * هنا `11–12` بكسلاً (لا يُعفى بقاعدة النصّ الكبير). و`700` يرفعها إلى `5.0–5.9`. الوضع
 * الداكن يبقى على `400`: مقيس بين `7.8` و`8.8`.
 */
export const STAGE_TEXT: Record<Stage, string> = {
  NEW: "text-slate-500 dark:text-slate-400",
  CONTACTED: "text-sky-700 dark:text-sky-400",
  QUOTED: "text-amber-700 dark:text-amber-400",
  NEGOTIATING: "text-orange-700 dark:text-orange-400",
  WON: "text-emerald-700 dark:text-emerald-400",
  LOST: "text-rose-700/70 dark:text-rose-400/70",
};

export const STAGE_DOT: Record<Stage, string> = {
  NEW: "bg-slate-400",
  CONTACTED: "bg-sky-500",
  QUOTED: "bg-amber-500",
  NEGOTIATING: "bg-orange-500",
  WON: "bg-emerald-500",
  LOST: "bg-rose-500/60",
};

/**
 * لماذا سقط — السؤال الذي كانت «مؤرشف» تبتلعه.
 *
 * بلا جوابه يبقى الخاسرون رقماً ميتاً؛ ومعه يُعرف إن كان السعر يطرد الناس أم المتابعة تتأخّر
 * أم السوق غلط. وهذه القائمة قصيرة عمداً: خمسة أسباب تُختار في ثانية، والسادس يكتب نفسه.
 */
export const LOST_REASONS = ["PRICE", "COMPETITOR", "NO_RESPONSE", "NOT_NOW", "NOT_A_FIT", "OTHER"] as const;
export type LostReason = (typeof LOST_REASONS)[number];

export const LOST_LABEL: Record<LostReason, string> = {
  PRICE: "السعر",
  COMPETITOR: "منافس",
  NO_RESPONSE: "لا يوجد ردّ",
  NOT_NOW: "ليس الآن",
  NOT_A_FIT: "غير مناسب",
  OTHER: "سبب آخر",
};

/**
 * قنوات التواصل — ترتيبها ترتيب استعمالها لا ترتيب الحروف: التليفون والواتساب أوّلاً لأنهما
 * تسعة من كل عشرة، والزيارة والملاحظة في الآخر.
 */
export const CHANNELS = ["CALL", "WHATSAPP", "EMAIL", "MEETING", "VISIT", "NOTE"] as const;
export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LABEL: Record<Channel, string> = {
  CALL: "مكالمة",
  WHATSAPP: "واتساب",
  EMAIL: "إيميل",
  MEETING: "اجتماع",
  VISIT: "زيارة",
  NOTE: "ملاحظة",
};

/** أفعالٌ للماضي — السجلّ يُقرأ كسرد: «كلّمتها»، «بعتّ لها واتساب». */
export const CHANNEL_VERB: Record<Channel, string> = {
  CALL: "مكالمة مع",
  WHATSAPP: "واتساب لـ",
  EMAIL: "إيميل لـ",
  MEETING: "اجتماع مع",
  VISIT: "زيارة لـ",
  NOTE: "ملاحظة على",
};

// سقط `TIER_LABEL` (٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد): أسماء باقاتٍ مكتوبة في الكود بلا
// مستهلك. اسم الباقة من `CommercialPlan.name` وحده (`priceLeadDeal`).


/**
 * المبلغ بعملته — بـ`Intl.NumberFormat` لا بتنسيقٍ مكتوب بيد، وبلا كسور: المندوبة تقارن
 * أحجاماً لا تحاسب قروشاً، والكسر يزيد ثلاثة محارف في عمودٍ يُمسح بالعين.
 *
 * وبلا عملةٍ لا مبلغ (٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد): العملة من صفّ السعر، وكان الغائب
 * يُكتب ريالاً افتراضاً — رقمٌ بعملةٍ مخمَّنة.
 */
export function formatMoney(amount: number | null | undefined, currency: string | null | undefined): string | null {
  if (amount == null || amount === 0 || !currency) return null;
  const n = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(amount);
  return `${n} ${currencyLabel(currency)}`;
}

export type DueTone = "overdue" | "today" | "soon" | "later" | "none";

/**
 * «متأخر يومين» لا «٢ سبتمبر».
 *
 * التاريخ المجرّد يحتاج طرحاً ذهنياً عند كل صفّ؛ والمندوبة تمسح عشرين صفّاً بحثاً عن
 * «مَن فاتني». الفرق يُحسب بفارق الأيام التقويمية لا بالساعات — موعدٌ بعد ٢٥ ساعة هو
 * «بكرة» لا «بعد يوم»، وهكذا تقولها هي.
 */
export function describeDue(at: Date | null | undefined, now = new Date()): { text: string; tone: DueTone } {
  if (!at) return { text: "بدون موعد", tone: "none" };
  const day = (d: Date) => Math.floor(new Date(d).setHours(0, 0, 0, 0) / 86_400_000);
  const diff = day(at) - day(now);

  if (diff < 0) {
    const n = Math.abs(diff);
    const text = n === 1 ? "متأخّر يوم" : n === 2 ? "متأخّر يومين" : `متأخّر ${n} يوم`;
    return { text, tone: "overdue" };
  }
  if (diff === 0) return { text: "اليوم", tone: "today" };
  if (diff === 1) return { text: "غداً", tone: "soon" };
  if (diff === 2) return { text: "بعد غد", tone: "soon" };
  if (diff <= 7) return { text: `بعد ${diff} أيام`, tone: "soon" };
  return {
    text: new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" }).format(at),
    tone: "later",
  };
}

export const DUE_TONE: Record<DueTone, string> = {
  overdue: "text-rose-700 dark:text-rose-400",
  today: "text-amber-700 dark:text-amber-400",
  soon: "text-foreground",
  later: "text-muted-foreground",
  none: "text-muted-foreground/60",
};

/** رموز الاتصال الدولية للسوقين. */
const DIAL_CODE: Record<string, string> = { SA: "966", EG: "20" };

/**
 * رقمٌ صالحٌ لرابط واتساب — دوليٌّ كامل بلا صفرٍ بادئ ولا رموز.
 *
 * `wa.me` لا يفتح المحادثة إلا برقمٍ دوليٍّ كامل. وكان الرابط يُبنى من الأرقام كما كُتبت،
 * فمَن سُجِّل رقمها `01099887766` صار رابطها `wa.me/01099887766` — لا يفتح شيئاً. ومَن سُجِّل
 * `+201115556677` عمل صحيحاً بالمصادفة، فبقي العطل مخفيّاً في نصف الصفوف.
 *
 * والدولة هي المصدر: الصفر البادئ محلّيّ يُسقط، ثم يُركَّب رمز سوق العميل — والرقم المكتوب
 * دولياً أصلاً يُترك كما هو.
 *
 * تُرجع `null` لما لا يصلح، فلا يُرسم زرٌّ يقود إلى صفحة خطأ.
 */
export function waNumber(phone: string | null | undefined, countryCode: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;

  const code = DIAL_CODE[countryCode ?? ""] ?? null;

  // مكتوبٌ دولياً بالفعل (يبدأ برمز سوقٍ نعرفه) — يُترك.
  for (const c of Object.values(DIAL_CODE)) {
    if (digits.startsWith(`00${c}`)) return digits.slice(2);
    if (digits.startsWith(c) && digits.length > c.length + 8) return digits;
  }

  if (!code) return null;
  return `${code}${digits.replace(/^0+/, "")}`;
}
