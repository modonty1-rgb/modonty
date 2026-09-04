import { z } from "zod";
import { LOST_REASONS, PICKABLE_STAGES, STAGES } from "./funnel";

/**
 * One schema, enforced on the server. The form mirrors it for instant feedback, but the
 * browser copy is a convenience — this is the one that decides what gets written.
 *
 * Almost everything is optional on purpose. A prospect is captured mid-phone-call, and a
 * form that refuses to save until eleven boxes are filled means the row never exists at
 * all. Measured on the rows imported from the old system: ten fields are empty in every
 * single one.
 *
 * Exactly two are required, and both were measured on the 20 real rows: a NAME (a record
 * of nobody is not a record) and a PHONE (20/20 filled — a lead you cannot call is a row
 * no one will ever work).
 */

const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

/**
 * كل سوقٍ وشكل جوّاله.
 *
 * `strip` تُسقط رمز الدولة وصفره البادئ فيبقى الرقم الوطنيّ وحده، لأن نفس الجوّال يصل مكتوباً
 * `+201001234567` و`01001234567` و`00201001234567` — وثلاثتها رقمٌ واحد.
 *
 * السعودية `5XXXXXXXX` تسعة أرقام، ومصر `1[0125]XXXXXXXX` عشرة. والبادئات الأربع هي شبكات
 * مصر الأربع؛ رقمٌ يبدأ بغيرها ليس جوّالاً مصريّاً.
 */
const MOBILE = {
  SA: {
    label: "سعودي",
    strip: (d: string) => d.replace(/^00966/, "").replace(/^966/, "").replace(/^0/, ""),
    test: /^5\d{8}$/,
    // أرقام لاتينية: الخانة نفسها `dir="ltr"` ويُكتب فيها الرقم لاتينياً، فمثالٌ بالأرقام
    // العربية يُقرأ شكلاً آخر لا نموذجاً يُحتذى.
    hint: "05X XXX XXXX",
  },
  EG: {
    label: "مصري",
    strip: (d: string) => d.replace(/^0020/, "").replace(/^20/, "").replace(/^0/, ""),
    test: /^1[0125]\d{8}$/,
    hint: "01X XXXX XXXX",
  },
} as const;

/** هل يصحّ هذا الرقم في هذا السوق؟ — المنطق نفسه الذي تستعمله الشاشة، فلا ينفصل الاثنان. */
export function isMobileFor(phone: string, country: "SA" | "EG"): boolean {
  const m = MOBILE[country];
  return m.test.test(m.strip((phone ?? "").replace(/\D/g, "")));
}

export const MOBILE_HINT: Record<"SA" | "EG", string> = { SA: MOBILE.SA.hint, EG: MOBILE.EG.hint };
const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max).optional());

export const leadSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير أوي").max(160),
  company: optionalText(160),

  /**
   * الجوّال مطلوب — والصيغة فضفاضة.
   *
   * مطلوبٌ لأن العشرين صفّاً في القاعدة كلّها فيها رقم (**٢٠/٢٠**)، وعميلٌ محتمل بلا رقم لا
   * يمكن الاتصال به ولا متابعته ولا عرض باقة عليه: صفٌّ يُحفظ ثم لا يُعمل عليه أبداً.
   *
   * وفضفاضٌ عمداً: الأرقام تصل بصيغ مختلفة (+2010… · 0100… · بمسافات وشرطات)، ونمطٌ صارم
   * هنا يرفض رقماً مصرياً حقيقياً فلا يُحفظ الصفّ أصلاً.
   */
  phone: z.string().trim().min(6, "لازم رقم جوّال").max(40),

  email: z.preprocess(blankToUndefined, z.string().trim().email("الإيميل مش مظبوط").optional()),

  city: optionalText(120),
  website: optionalText(300),
  googleLocation: optionalText(600),

  /**
   * الحملة تُمسح إن لم يكن الإعلان مدفوعاً.
   *
   * وإلا بقي اسمُ حملةٍ على عميلٍ جاء من ترشيح — تدوس «أيوه» وتكتب، ثم تعود إلى «لا» وتحفظ،
   * فيبقى الاسم مخزّناً وغير ظاهر، ويُحسب في التقرير. التنظيف على السيرفر لا في الشاشة، لأن
   * الشاشة ليست الحارس.
   */
  isPaidAd: z.preprocess((v) => v === true || v === "true" || v === "1", z.boolean()),
  campaign: optionalText(120),
  sourceNote: optionalText(200),

  industryId: z.preprocess(blankToUndefined, z.string().trim().optional()),

  /** ما كتبته المندوبة حين لم يكن مجال العميل في القائمة — دليلُنا على ما ينقص القائمة. */
  industryOther: optionalText(120),
  countryCode: z.preprocess(blankToUndefined, z.enum(["SA", "EG"]).optional()),
  /**
   * نصٌّ لا قائمة مغلقة — وهذا هو بيت القصيد.
   *
   * كان `z.enum` بالقيم الستّ الموروثة، فبقي حارساً يرفض كل مصدرٍ يضيفه خالد من «Dropdown
   * Lists»: أضفتُ «انستقرام» فرُفض الحفظ **بصمت**، لأن القائمة لا تعرض خطأها. حارسٌ يمنع
   * الميزة التي بُني لأجلها الجدول.
   *
   * والتحقّق الحقيقي في مكانه: `getLeadSources` لا يعرض إلا المفعَّل، والقيمة تأتي من صفٍّ
   * موجود. وقيمةٌ لمصدرٍ أُقفل لاحقاً يجب أن تُحفظ لا أن تُرفض — وإلا فتعديل تليفونِ عميلٍ
   * قديم يفشل بسبب حقلٍ لم يُلمس.
   */
  source: optionalText(60),

  // المراحل التي تُختار بيد فقط. `WON` يكتبه التحويل و`LOST` له حواره الذي يسأل عن السبب،
  // فقبولهما هنا يفتح باباً يتجاوز الاثنين.
  stage: z.enum(PICKABLE_STAGES).default("NEW"),

  // الصفقة — وهي ما كان الفورم كلّه لا يسأل عنه.
  expectedTier: z.preprocess(
    blankToUndefined,
    z.enum(["BASIC", "STANDARD", "PRO", "PREMIUM"]).optional(),
  ),
  expectedMonthly: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().min(0, "المبلغ لا يصحّ أن يكون سالباً").max(1_000_000).optional(),
  ),

  /** ٣ · ٦ · ١٢ فقط — القائمة المغلقة نفسها التي في `pricing-durations.ts`. */
  expectedMonths: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.union([z.literal(3), z.literal(6), z.literal(12)]).optional(),
  ),
  currency: z.preprocess(blankToUndefined, z.enum(["SAR", "EGP"]).optional()),

  // موعد المتابعة — أهمّ حقل في الشاشة. يُقبل فارغاً: عميلٌ لم يُتّفق معه على موعد بعد ليس
  // خطأً، لكنه سيظهر في القائمة بـ«مافيش موعد» كي لا يضيع بصمت.
  nextActionAt: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? new Date(`${v}T09:00:00`) : undefined),
    z.date().optional(),
  ),
  nextActionNote: optionalText(200),

  ownerId: z.preprocess(blankToUndefined, z.string().trim().optional()),

  instagram: optionalText(300),
  facebook: optionalText(300),
  tiktok: optionalText(300),
  snapchat: optionalText(300),
  twitter: optionalText(300),
  linkedin: optionalText(300),

  /** سطر السجلّ الأوّل — يُكتب في `SalesLeadNote` لا في عمودٍ على الصفّ، فلا يمسحه ما بعده. */
  note: optionalText(4000),
})
  /**
   * الجوّال يُقاس على مفتاح الدولة (خالد ٤ سبتمبر).
   *
   * والرسالة تسمّي **الحلّ** لا العطل: الحالة الغالبة أن الرقم صحيحٌ والدولة هي الغلط — مقيس
   * على الصفوف الحالية: ثلاثةٌ من اثنين وعشرين أرقامها مصرية وسوقها «السعودية». فحين يطابق
   * الرقمُ السوقَ الآخر تقول له الرسالة ذلك صراحةً، بدل «الرقم غير صحيح» التي تدفعه ليصحّح
   * رقماً سليماً.
   *
   * ولا يُفحص إن كانت الدولة غير محدّدة: حارسٌ لا يعرف على أيّ سوقٍ يقيس يرفض بلا معنى.
   */
  .superRefine((v, ctx) => {
    const cc = v.countryCode;
    if (!cc || !v.phone) return;
    if (isMobileFor(v.phone, cc)) return;

    const other = cc === "SA" ? "EG" : "SA";
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: isMobileFor(v.phone, other)
        ? `الرقم ده ${MOBILE[other].label} — بدّلي الدولة أو صحّحي الرقم`
        : `مش رقم جوّال ${MOBILE[cc].label} — الشكل: ${MOBILE[cc].hint}`,
    });
  })
  /**
   * الخانتان تتبادلان المكان، فيُمسح ما لا يخصّ الاختيار.
   *
   * الشاشة تعرض واحدةً فقط، لكن التبديل بعد الكتابة يترك الأخرى مكتوبةً وغير ظاهرة — فتُحفظ
   * ملاحظةٌ على عميلٍ مدفوع، أو اسمُ حملةٍ على عميلٍ جاء وحده ويُحسب في تقرير الحملات.
   * والتنظيف هنا لا في الشاشة: الشاشة ليست الحارس.
   *
   * و`null` لا `undefined`: في بريزما `undefined` تعني «لا تمسّ هذا الحقل» لا «امسحه»، فكانت
   * الخانة القديمة تبقى في الصفّ بعد التبديل. مقيس: حوّلتُ عميلاً إلى «طبيعي» وحفظت، فبقي
   * `campaign: "رمضان-٢٠٢٦-انستقرام"` مع `isPaidAd: false` — صفٌّ يناقض نفسه، وحملةٌ تُحسب
   * على عميلٍ لم يأتِ منها.
   */
  .transform((v) =>
    v.isPaidAd ? { ...v, sourceNote: null } : { ...v, campaign: null },
  )
  /**
   * ومجالٌ من القائمة يمسح المكتوب بيد.
   *
   * «مجال تاني» ليس معرّفاً في `Industry`، فيصل `industryId` إلى `resolveIndustry` ويعود
   * `null` — يبقى النصّ وحده، وهو المطلوب. أمّا العكس فيحتاج مسحاً صريحاً: مَن اختارت
   * «عيادة بيطرية» ثم صحّحتها إلى «الرعاية الصحية» تترك خلفها نصّاً يناقض المعرّف، ويُحسب
   * في جرد «المجالات الناقصة» على مجالٍ صار موجوداً.
   */
  .transform((v) => {
    // «مجال تاني» علامةُ شاشةٍ لا معرّف — تُسقط هنا فلا تصل القاعدة أصلاً.
    if (v.industryId === "__other__") return { ...v, industryId: undefined };
    return v.industryId ? { ...v, industryOther: null } : v;
  });

export type LeadInput = z.input<typeof leadSchema>;
export type LeadParsed = z.output<typeof leadSchema>;

export { LOST_REASONS, STAGES };
