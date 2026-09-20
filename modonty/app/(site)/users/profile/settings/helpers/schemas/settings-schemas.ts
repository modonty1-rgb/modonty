import { z } from "zod";

import { passwordField } from "@/lib/auth/password-rule";

// `z.string().url()` alone ACCEPTS `data:` URIs (verified on zod 3.24.2) — that is how a
// whole base64 image used to land inside User.image. Avatars must be a real hosted URL.
const hostedImageUrl = z
  .string()
  .url("يجب أن يكون رابط صحيح")
  .refine((v) => /^https?:\/\//i.test(v), "الصورة لازم تكون مرفوعة على الاستضافة، مش ملفاً مضمّناً");

export const profileSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين").max(100, "الاسم طويل جداً"),
  bio: z.string().max(500, "السيرة الذاتية يجب أن تكون أقل من 500 حرف").optional(),
  image: hostedImageUrl.optional().nullable(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة").optional(),
  newPassword: passwordField,
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

export const createPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
export type CreatePasswordFormData = z.infer<typeof createPasswordSchema>;
