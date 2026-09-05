import { z } from "zod";

import { CHANNELS, PICKABLE_STAGES } from "./funnel";

/**
 * صفّ متابعة واحد — تواصلٌ حصل، ومعه الموعد الذي أنتجه إن وُجد.
 *
 * `body` وحده إلزاميّ. صفُّ متابعةٍ بلا كلام يكلّف قراءةً ولا يقول للتالي شيئاً، وهو الفرق
 * بين سجلٍّ يُقرأ وبين عدّادِ مكالمات.
 */
const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

/**
 * التاريخ يصل من الخانة الأصلية كـ`YYYY-MM-DD` بلا ساعة. تُثبَّت التاسعة صباحاً محلّياً لا
 * منتصف الليل: منتصف الليل بتوقيت الرياض هو اليوم السابق بتوقيت UTC، فيظهر الموعد «متأخر يوم»
 * وهو لم يحِن بعد.
 */
const dayToDate = (v: unknown) =>
  typeof v === "string" && v.trim() ? new Date(`${v}T09:00:00`) : v instanceof Date ? v : undefined;

export const followUpSchema = z.object({
  channel: z.enum(CHANNELS).default("CALL"),

  /** حصل إمتى — لا متى كُتب. تسجيل مكالمة الأمس هذا الصباح هي الحالة العادية. */
  happenedAt: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? new Date(v) : v instanceof Date ? v : new Date()),
    z.date(),
  ),

  body: z.string().trim().min(2, "اكتبي ما حدث").max(4000),

  nextActionAt: z.preprocess(dayToDate, z.date().optional()),
  nextActionNote: z.preprocess(blankToUndefined, z.string().trim().max(200).optional()),

  /**
   * المرحلة التي انتقل إليها في هذا التواصل. اختيارية: أغلب المكالمات لا تحرّك المرحلة،
   * وإجبار المندوبة على اختيارها كل مرّة يجعلها تختار الحالية فيمتلئ السجلّ بحركةٍ لم تحدث.
   * و`WON`/`LOST` ليسا هنا — لكلٍّ منهما فعله الخاصّ.
   */
  stageAfter: z.preprocess(blankToUndefined, z.enum(PICKABLE_STAGES).optional()),
});

export type FollowUpInput = z.input<typeof followUpSchema>;

/** سبب الخسارة — حوارٌ مستقلّ لأنه ينقل العميل إلى مرحلةٍ طرفية لا رجعة منها بضغطة. */
export const lostSchema = z.object({
  reason: z.enum(["PRICE", "COMPETITOR", "NO_RESPONSE", "NOT_NOW", "NOT_A_FIT", "OTHER"]),
  note: z.preprocess(blankToUndefined, z.string().trim().max(600).optional()),
});

export type LostInput = z.input<typeof lostSchema>;
