import { formatCount } from "./format-count";

export type SilenceTone = "fresh" | "warm" | "cold" | "dead";

/**
 * **من متى ساكت؟** — السؤال الذي لم تكن الشاشة تسأله.
 *
 * الجدول كان يعرض «المتابعة القادمة» وحدها: التزامٌ في المستقبل. والمقيس أن ٥٪ فقط من
 * المفتوحين لهم موعد، فالعمود يقول «بدون موعد» تسعة عشر مرّة ولا يقول الأهمّ — أن سبعةَ عشرَ
 * منهم **لم يكلّمهم أحد منذ أكثر من ثلاثين يوماً**، ووسيط أعمارهم في الفانل ٦٥ يوماً.
 *
 * وعميلٌ ساكتٌ شهراً ليس «مفتوحاً» إلا في الجدول؛ هو خسارةٌ لم تُسجَّل. فصار الصمت رقماً
 * يُقرأ ويُرشَّح عليه.
 *
 * العتبات من دورة البيع لا من الذوق: أسبوعٌ حيّ، أسبوعان يبردان، شهرٌ بارد، وما فوقه ميت.
 */
export function describeSilence(
  lastTouchAt: Date | null | undefined,
  now = new Date(),
): { days: number | null; text: string; tone: SilenceTone } {
  if (!lastTouchAt) return { days: null, text: "—", tone: "fresh" };

  const day = (d: Date) => Math.floor(new Date(d).setHours(0, 0, 0, 0) / 86_400_000);
  const days = Math.max(0, day(now) - day(lastTouchAt));

  const text =
    days === 0 ? "اليوم"
    : days === 1 ? "أمس"
    : days === 2 ? "قبل يومين"
    // أرقام هندية كبقيّة الشاشة — `65 يوم` جوار `٤ سبتمبر` توقف العين على غير معنى.
    : `${formatCount(days)} يوم`;

  const tone: SilenceTone = days >= 30 ? "dead" : days >= 14 ? "cold" : days >= 7 ? "warm" : "fresh";
  return { days, text, tone };
}

/** حدّ «الساكت» — الرقم نفسه الذي تعدّه البطاقة ويرشّح به الجدول، فلا يفترقان. */
export const SILENT_AFTER_DAYS = 30;

/**
 * درجات `700` في الفاتح — مقيسةً على الأبيض: `amber-600 3.19` و`orange-600 3.56` ترسبان
 * تحت `4.5` عند حجم ١٢ بكسلاً. نفس قرار `DUE_TONE` في `funnel.ts`.
 */
export const SILENCE_TONE: Record<SilenceTone, string> = {
  fresh: "text-muted-foreground",
  warm: "text-amber-700 dark:text-amber-400",
  cold: "text-orange-700 dark:text-orange-400",
  dead: "text-rose-700 dark:text-rose-400",
};
