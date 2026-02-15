import { z } from "zod";

export const askClientSchema = z.object({
  name: z
    .string()
    .min(2, "الاسم يجب أن يكون على الأقل حرفين")
    .max(100, "الاسم طويل جداً"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  question: z
    .string()
    .min(10, "السؤال يجب أن يكون على الأقل 10 أحرف")
    .max(2000, "السؤال طويل جداً"),
});

export type AskClientFormData = z.infer<typeof askClientSchema>;
