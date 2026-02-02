import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين").max(100, "الاسم طويل جداً"),
  bio: z.string().max(500, "السيرة الذاتية يجب أن تكون أقل من 500 حرف").optional(),
  image: z.string().url("يجب أن يكون رابط صحيح").optional().nullable(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة").optional(),
  newPassword: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون على الأقل 8 أحرف")
    .regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل")
    .regex(/[a-z]/, "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل")
    .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

export const createPasswordSchema = z
  .object({
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

export const privacySchema = z.object({
  profileVisibility: z.enum(["public", "connections", "private"]).default("public"),
  showEmail: z.boolean().default(false),
  showActivity: z.boolean().default(true),
  showComments: z.boolean().default(true),
  showLikes: z.boolean().default(true),
  showFavorites: z.boolean().default(true),
});

export const notificationSchema = z.object({
  emailCommentReplies: z.boolean().default(true),
  emailCommentLikes: z.boolean().default(true),
  emailArticleLikes: z.boolean().default(true),
  emailNewArticles: z.boolean().default(true),
  emailWeeklyDigest: z.boolean().default(false),
  inAppNotifications: z.boolean().default(true),
  notificationSound: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),
});

export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.enum(["ar", "en"]).default("ar"),
  fontSize: z.enum(["small", "medium", "large"]).default("medium"),
  layout: z.enum(["compact", "comfortable"]).default("comfortable"),
  defaultSort: z.enum(["newest", "oldest", "popular"]).default("newest"),
  itemsPerPage: z.number().min(5).max(50).default(10),
  autoExpandComments: z.boolean().default(false),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
export type CreatePasswordFormData = z.infer<typeof createPasswordSchema>;
export type PrivacyFormData = z.infer<typeof privacySchema>;
export type NotificationFormData = z.infer<typeof notificationSchema>;
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
