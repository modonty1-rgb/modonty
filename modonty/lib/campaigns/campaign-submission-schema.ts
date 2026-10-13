import { z } from "zod";

/**
 * Only explicitly configured campaign keys may accept public submissions.
 * This prevents a public endpoint from becoming a campaign-creation API.
 */
export const campaignDefinitions = {
  "search-visibility-launch": {
    name: "حملة الظهور في البحث",
    landingPath: "/search-visibility",
  },
} as const;

const optionalTrackingValue = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((value) => value || undefined);

export const campaignSubmissionSchema = z.object({
  campaignKey: z.literal("search-visibility-launch"),
  formKey: z.string().trim().min(2).max(80),
  idempotencyKey: z.string().uuid("تعذّر إنشاء رمز الطلب. حدّث الصفحة وحاول مرة ثانية."),
  businessName: z.string().trim().min(2, "اكتب اسم الشركة أو المشروع.").max(160),
  email: z.string().trim().email("اكتب بريدًا إلكترونيًا صحيحًا.").max(254),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{6,24}$/, "اكتب رقم تواصل صحيحًا."),
  sector: z.string().trim().min(2, "اختر مجال النشاط.").max(100),
  landingPath: z.string().trim().startsWith("/").max(200),
  utmSource: optionalTrackingValue,
  utmMedium: optionalTrackingValue,
  utmCampaign: optionalTrackingValue,
  utmContent: optionalTrackingValue,
  utmTerm: optionalTrackingValue,
  referrer: optionalTrackingValue,
});

export type CampaignSubmissionInput = z.infer<typeof campaignSubmissionSchema>;
