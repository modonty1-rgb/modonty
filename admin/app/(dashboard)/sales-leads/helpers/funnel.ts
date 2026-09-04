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
 */
export const STAGE_TEXT: Record<Stage, string> = {
  NEW: "text-slate-500 dark:text-slate-400",
  CONTACTED: "text-sky-600 dark:text-sky-400",
  QUOTED: "text-amber-600 dark:text-amber-400",
  NEGOTIATING: "text-orange-600 dark:text-orange-400",
  WON: "text-emerald-600 dark:text-emerald-400",
  LOST: "text-rose-600/70 dark:text-rose-400/70",
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

export const TIER_LABEL: Record<string, string> = {
  BASIC: "الأساسية",
  STANDARD: "المتوسّطة",
  PRO: "الاحترافية",
  PREMIUM: "المتميّزة",
};

const CURRENCY_LABEL: Record<string, string> = { SAR: "ر.س", EGP: "ج.م" };

/**
 * المبلغ بعملته — بـ`Intl.NumberFormat` لا بتنسيقٍ مكتوب بيد، وبلا كسور: المندوبة تقارن
 * أحجاماً لا تحاسب قروشاً، والكسر يزيد ثلاثة محارف في عمودٍ يُمسح بالعين.
 */
export function formatMoney(amount: number | null | undefined, currency: string | null | undefined): string | null {
  if (amount == null || amount === 0) return null;
  const n = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(amount);
  return `${n} ${CURRENCY_LABEL[currency ?? "SAR"] ?? currency ?? ""}`.trim();
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
  if (!at) return { text: "مافيش موعد", tone: "none" };
  const day = (d: Date) => Math.floor(new Date(d).setHours(0, 0, 0, 0) / 86_400_000);
  const diff = day(at) - day(now);

  if (diff < 0) {
    const n = Math.abs(diff);
    const text = n === 1 ? "متأخر يوم" : n === 2 ? "متأخر يومين" : `متأخر ${n} يوم`;
    return { text, tone: "overdue" };
  }
  if (diff === 0) return { text: "النهارده", tone: "today" };
  if (diff === 1) return { text: "بكرة", tone: "soon" };
  if (diff === 2) return { text: "بعد بكرة", tone: "soon" };
  if (diff <= 7) return { text: `بعد ${diff} أيام`, tone: "soon" };
  return {
    text: new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" }).format(at),
    tone: "later",
  };
}

export const DUE_TONE: Record<DueTone, string> = {
  overdue: "text-rose-600 dark:text-rose-400",
  today: "text-amber-600 dark:text-amber-400",
  soon: "text-foreground",
  later: "text-muted-foreground",
  none: "text-muted-foreground/60",
};
