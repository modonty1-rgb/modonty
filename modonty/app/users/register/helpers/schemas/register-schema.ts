import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "الاسم يجب أن يكون على الأقل حرفين")
      .max(100, "الاسم طويل جداً"),
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    password: z
      .string()
      .min(8, "كلمة المرور يجب أن تكون على الأقل 8 أحرف")
      .regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل")
      .regex(/[a-z]/, "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل")
      .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
