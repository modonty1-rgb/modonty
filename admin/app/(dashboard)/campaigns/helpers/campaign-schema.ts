import { z } from "zod";

import { MARKETS } from "./channels";

const CHANNELS = [
  "TIKTOK", "YOUTUBE", "SNAPCHAT", "INSTAGRAM",
  "FACEBOOK", "TWITTER", "LINKEDIN", "GOOGLE",
] as const;

const OBJECTIVES = ["LEADS", "SALES", "TRAFFIC", "ENGAGEMENT", "AWARENESS"] as const;
const STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "ENDED"] as const;

/** خانةٌ فارغة تصل `""` لا `undefined` — فتُترجَم عند الحدّ مرّةً بدل أن تُفحص في كل حقل. */
const optionalText = z.string().trim().transform((v) => (v === "" ? null : v)).nullable();

/**
 * رسائل المنع تسمّي الحقل والعطل — لا «تحقّق من البيانات».
 *
 * البوّابة تبقى مقفلة، والذي يُصلَح هو الرسالة: مَن يُمنع ولا يُقال له أين، يجرّب حتى يملّ ثم
 * يكتب في الملاحظات ما كان يجب أن يكتبه في خانته.
 */
export const campaignSchema = z
  .object({
    name: z.string().trim().min(2, "اسم الحملة ناقص — اكتب اسماً يعرفه مَن يقرؤه بعد شهرين"),

    countryCode: z.enum(["SA", "EG"], { message: "اختر السوق — منه تجيء العملة" }),
    site: z.enum(["MODONTY", "JBRSEO"], { message: "اختر الموقع الذي يوصّل إليه الإعلان" }).default("MODONTY"),
    channel: z.enum(CHANNELS, { message: "اختر القناة — منها يُبنى وسم الرابط" }),
    objective: z.enum(OBJECTIVES, { message: "اختر هدف الحملة كما ضُبط في المنصّة" }),
    status: z.enum(STATUSES).default("DRAFT"),

    startAt: z.coerce.date({ message: "تاريخ البداية غير مقروء" }),
    endAt: z.coerce.date({ message: "تاريخ النهاية إلزاميّ — منه يُحسب عدد الأيام" }),

    dailyBudget: z.coerce
      .number({ message: "ميزانية اليوم رقمٌ لا نصّ" })
      .positive("ميزانية اليوم لازم تكون أكبر من صفر"),

    spendCap: z
      .union([z.literal(""), z.coerce.number().positive("سقف الصرف لازم يكون أكبر من صفر")])
      .transform((v) => (v === "" ? null : (v as number)))
      .nullable(),

    /** نيّة الحملة — نصٌّ حرّ بقرار خالد، يُقرأ عند المراجعة ولا يُجمَّع في تقرير. */
    targetRegion: optionalText,
    targetAge: optionalText,
    targetAudience: optionalText,
    landingPath: optionalText,

    platformCampaignId: optionalText,

    utmCampaign: z
      .string()
      .trim()
      .min(3, "وسم الرابط ناقص")
      // لاتينيّ صغير بشرطات: العربيّ يصل مرمَّزاً بالنسبة المئوية فلا يُقرأ في أيّ تقرير.
      .regex(/^[a-z0-9-]+$/, "وسم الرابط بحروفٍ لاتينية صغيرة وأرقامٍ وشرطات فقط"),

    note: optionalText,
  })
  /**
   * النهاية بعد البداية — والحارس هنا لا في الشاشة وحدها.
   *
   * نهايةٌ قبل بدايةٍ تُخرج عدد أيامٍ سالباً، فيصير الإجماليّ المعروض سالباً وتكلفةُ العميل
   * المحسوبة عليه كذلك. والحدّ هو المكان الوحيد الذي لا يُتجاوَز.
   */
  .refine((v) => v.endAt.getTime() >= v.startAt.getTime(), {
    path: ["endAt"],
    message: "النهاية قبل البداية — راجع التاريخين",
  })
  /** سقفٌ أقلّ من ميزانية يومٍ واحد يوقف الحملة قبل أن تبدأ. */
  .refine((v) => v.spendCap === null || v.spendCap >= v.dailyBudget, {
    path: ["spendCap"],
    message: "سقف الصرف أقلّ من ميزانية يوم واحد",
  });

export type CampaignInput = z.input<typeof campaignSchema>;

/** العملة نتيجةٌ للسوق لا سؤالٌ مستقلّ — تُكتب من هنا عند الحفظ. */
export const marketDefaults = (countryCode: string) =>
  MARKETS.find((m) => m.code === countryCode) ?? MARKETS[0];
