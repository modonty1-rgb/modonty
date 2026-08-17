import { z } from "zod";

/**
 * Booking form input. No login required — the phone number identifies the lead.
 * Visitor provides phone (required) + optional name + optional preferred date + note.
 * For logged-in users the name prefills from the session; email is taken server-side.
 * Phone is submitted as E.164 (`+<countrycode><national>`) by the international
 * PhoneField (country selector + Vercel-geo default). Any country the visitor selects
 * is accepted — the client-side field enforces per-country length before submit.
 */
const phoneRegex = /^\+\d{8,15}$/;

export const bookingSchema = z.object({
  name: z.string().trim().max(80, "الاسم طويل جداً").optional().or(z.literal("")),
  // Optional — lets the provider reply by email if they prefer it over phone.
  email: z.string().trim().email("أدخل بريداً إلكترونياً صحيحاً").optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(1, "رقم الجوال مطلوب")
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => phoneRegex.test(v), "أدخل رقم جوال صحيح"),
  preferredAt: z
    .union([z.string(), z.null()])
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const d = new Date(val);
        return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
      },
      { message: "اختر موعداً في المستقبل" }
    ),
  message: z.string().trim().max(1000, "الرسالة طويلة جداً").optional().or(z.literal("")),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
