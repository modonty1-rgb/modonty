import { z } from "zod";

export const registerSchema = z.object({
  // Optional — collected later in the user profile, or derived from Google.
  name: z.string().max(100, "الاسم طويل جداً").optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
