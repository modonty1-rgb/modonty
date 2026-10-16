import { z } from "zod";

const optionalTrackingValue = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((value) => value || undefined);

/** ضغطة واتساب من صفحة هبوط بلا نموذج — لا اسم ولا رقم، فقط من أين ومتى وأيّ زرّ. */
export const landingClickSchema = z.object({
  landingPath: z.string().trim().regex(/^\/[a-z0-9-]{1,60}$/, "مسار غير صالح."),
  cta: z.string().trim().min(1).max(40),
  eventId: z.string().trim().min(8).max(80),
  utmSource: optionalTrackingValue,
  utmMedium: optionalTrackingValue,
  utmCampaign: optionalTrackingValue,
  utmContent: optionalTrackingValue,
  utmTerm: optionalTrackingValue,
  referrer: optionalTrackingValue,
});
