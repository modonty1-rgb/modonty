import { z } from "zod";

import { MARKETS } from "./channels";

const CHANNELS = [
  "TIKTOK", "YOUTUBE", "SNAPCHAT", "INSTAGRAM",
  "FACEBOOK", "TWITTER", "LINKEDIN", "GOOGLE",
] as const;

const OBJECTIVES = ["LEADS", "SALES", "TRAFFIC", "ENGAGEMENT", "AWARENESS"] as const;

/** خانةٌ فارغة تصل `""` لا `undefined` — فتُترجَم عند الحدّ مرّةً بدل أن تُفحص في كل حقل. */
const optionalText = z.string().trim().transform((v) => (v === "" ? null : v)).nullable();
const optionalMoney = (message: string) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number({ message }).positive(message).nullable(),
  );

/**
 * بريف الحملة — ما يكتبه الميديا باير قبل أن يبني الإعلان، وعليه يوافق الأدمن (خالد ٢٩ سبتمبر
 * ٢٠٢٦: «الميديا باير قبل ما يسوي الإعلان يديني توصيف للإعلان والهدف منه، أنا أدي الأبروف»).
 *
 * الموافقة على **الهدف وسقف الميزانية** لا على تفاصيل المنصّة: المجموعات الإعلانية وتجارب A/B
 * يبنيها في ميتا كما يشاء، والأرقام تُسحب من هناك. فالإجباريّ هنا ما يُتّخذ عليه القرار:
 * الاسم · السوق · القناة · الهدف · البريف · سقف الميزانية · البداية.
 *
 * رسائل المنع تسمّي الحقل والعطل — لا «تحقّق من البيانات».
 */
export const campaignSchema = z
  .object({
    name: z.string().trim().min(2, "اسم الحملة ناقص — اكتب اسماً يعرفه مَن يقرؤه بعد شهرين"),
    countryCode: z.enum(["SA", "EG", "AE", "KW"], { message: "اختر السوق — منه تجيء العملة" }),
    site: z.enum(["MODONTY", "JBRSEO"]).default("MODONTY"),
    channel: z.enum(CHANNELS, { message: "اختر القناة" }),
    objective: z.enum(OBJECTIVES, { message: "اختر هدف الإعلان — عليه تُعطى الموافقة" }),
    brief: z.string().trim().min(10, "اكتب وصف الإعلان: العرض أو الرسالة، في جملة أو جملتين"),
    targetAudience: optionalText,

    spendCap: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce
        .number({ message: "سقف الميزانية إجباريّ — هو ما توافق عليه" })
        .positive("سقف الميزانية لازم يكون أكبر من صفر"),
    ),
    targetCostPerLead: optionalMoney("الرقم المستهدف رقمٌ أكبر من صفر"),
    destination: z.enum(["WEBSITE", "WHATSAPP", "PLATFORM_FORM"], { message: "اختر وين يروح العميل بعد الضغط" }),
    creativeUrl: z.preprocess(
      (v) => (v === "" || v == null ? null : v),
      z.string().trim().url("رابط التصاميم غير صحيح — انسخه كاملاً من Drive أو Figma").nullable(),
    ),

    startAt: z.coerce.date({ message: "تاريخ البداية غير مقروء" }),
    /** فارغة = مستمرّة حتى يُوقفها أحد. */
    endAt: z.preprocess(
      (v) => (v === "" || v == null ? null : v),
      z.coerce.date({ message: "تاريخ النهاية غير مقروء" }).nullable(),
    ),

    landingPath: optionalText,
    note: optionalText,
  })
  /**
   * النهاية بعد البداية — والحارس هنا لا في الشاشة وحدها: نهايةٌ قبل بدايةٍ تُخرج مدّةً سالبة.
   */
  .refine((v) => v.endAt === null || v.endAt.getTime() >= v.startAt.getTime(), {
    path: ["endAt"],
    message: "النهاية قبل البداية — راجع التاريخين",
  });

export type CampaignInput = z.input<typeof campaignSchema>;

/** العملة نتيجةٌ للسوق لا سؤالٌ مستقلّ — تُكتب من هنا عند الحفظ. */
export const marketDefaults = (countryCode: string) =>
  MARKETS.find((m) => m.code === countryCode) ?? MARKETS[0];
