import { z } from "zod";
import { SocialChannel, SocialFunnelStage, SocialPaidKind, SocialPostFormat } from "@prisma/client";

import { CURRENCY_OPTIONS } from "./social-labels";

/**
 * Zod لكل مدخلات تقويم السوشيال — الخادم لا يثق بالمتصفّح.
 *
 * القديم كان `updateEntry` يقبل أي حقول جزئية بلا تحقّق (`entries.ts:234`). هنا كل أكشن
 * يمرّ بأحد هذه المخطّطات قبل أن يلمس القاعدة.
 *
 * حدود الأحرف (س٨): التحذير في الواجهة كالقديم (نص >400 كهرماني، >800 أحمر …) — لا يمنع.
 * والسقف هنا سقف أمان فقط كي لا يُكتب نصّ بلا نهاية.
 */

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "معرّف غير صالح");

/** "" أو مسافات = غير محدَّد → null. */
const optionalText = (max: number) =>
  z
    .string()
    .max(max, `النص أطول من ${max} حرف`)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v.trim() : null));

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ غير صالح");

/** بريف كاتب المحتوى — الإنشاء والتعديل معاً (التعديل ينقل التاريخ أيضاً). */
export const postBriefSchema = z.object({
  /** يوم المنشور «YYYY-MM-DD» — يُخزَّن منتصف ليل UTC. */
  date: dateOnly,
  idea: z
    .string()
    .trim()
    .min(1, "أضف الفكرة أولاً")
    .max(500, "الفكرة أطول من ٥٠٠ حرف"),
  format: z.nativeEnum(SocialPostFormat).nullable(),
  funnelStages: z.array(z.nativeEnum(SocialFunnelStage)).max(4),
  channels: z.array(z.nativeEnum(SocialChannel)).max(8),
  text: optionalText(5000),
  hook: optionalText(1000),
  cta: optionalText(1000),
  scriptUrl: optionalText(2000),
  voiceTone: optionalText(500),
  inspiration: optionalText(2000),
  notes: optionalText(5000),
});
export type PostBriefInput = z.input<typeof postBriefSchema>;

export const createPostSchema = postBriefSchema.extend({
  clientId: objectIdSchema,
  /** checkbox «إرسال إشعار على Telegram» — مفعّل افتراضياً عند الإنشاء كالقديم. */
  notifyTelegram: z.boolean(),
});
export type CreatePostInput = z.input<typeof createPostSchema>;

export const updatePostSchema = postBriefSchema.extend({ postId: objectIdSchema });
export type UpdatePostInput = z.input<typeof updatePostSchema>;

const linkOrEmpty = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "الرابط يجب أن يبدأ بـ http:// أو https://");

/** بيانات الميديا باير — «حفظ بدون نشر» و«نشر» يمرّان بنفس المخطّط. */
export const publishDetailsSchema = z
  .object({
    postId: objectIdSchema,
    paidKind: z.nativeEnum(SocialPaidKind).nullable(),
    budget: z.number().nonnegative("المبلغ لا يكون سالباً").max(100_000_000).nullable(),
    currency: z.enum(CURRENCY_OPTIONS).nullable(),
    adDurationDays: z.number().int().min(1, "مدة الإعلان يوم واحد على الأقل").max(3650).nullable(),
    /** «YYYY-MM-DD» أو "" — تاريخ النشر بتوقيت الرياض. */
    publishDate: z.union([dateOnly, z.literal("")]),
    /** «HH:mm» أو "" — وقت النشر بتوقيت الرياض. */
    publishTime: z.union([z.string().regex(/^\d{2}:\d{2}$/, "وقت غير صالح"), z.literal("")]),
    channelLinks: z.record(z.nativeEnum(SocialChannel), linkOrEmpty),
  })
  .refine((v) => !(v.publishTime && !v.publishDate), {
    message: "حدّد تاريخ النشر مع الوقت",
    path: ["publishDate"],
  });
export type PublishDetailsInput = z.input<typeof publishDetailsSchema>;

export const rejectPostSchema = z.object({
  postId: objectIdSchema,
  note: z.string().max(2000, "الملاحظة أطول من ٢٠٠٠ حرف"),
});

export const assetLabelSchema = z.object({
  assetId: objectIdSchema,
  label: z.string().max(200),
});

export const videoAssetSchema = z.object({
  postId: objectIdSchema,
  videoId: z.string().regex(/^[a-f\d-]{36}$/i, "معرّف فيديو غير صالح"),
  label: z.string().max(200),
  bytes: z.number().int().nonnegative().max(2_000_000_000),
  width: z.number().int().nonnegative().max(20000),
  height: z.number().int().nonnegative().max(20000),
});
