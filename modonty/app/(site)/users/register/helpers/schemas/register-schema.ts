import { z } from "zod";

import { passwordField } from "@/lib/auth/password-rule";

export const registerSchema = z.object({
  // Optional — collected later in the user profile, or derived from Google.
  name: z.string().max(100, "الاسم طويل جداً").optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  /**
   * **ستّة لا ثمانية** (خالد ٢٠ سبتمبر ٢٠٢٦: «ثمانية حروف مرّة كثيرة، سهّلها»).
   *
   * وهذا قارئٌ يعلّق على مقال، لا موظّفٌ يفتح لوحة تحكّم. والحدُّ الأدنى الطويل على
   * حسابٍ بهذه المخاطرة يدفع الناسَ إلى كلماتٍ يعيدون استعمالها في كلّ مكان — وهو
   * أسوأُ من قصيرةٍ خاصّةٍ بموقعٍ واحد. والحسابُ محميٌّ أصلاً بتأكيد البريد.
   */
  password: passwordField,

  /**
   * **موافقةُ الرسائل التسويقيّة — اختياريّةٌ وصريحة.**
   *
   * خالد (٢٠ سبتمبر ٢٠٢٦): «نبغى تشيك بوكس إنّه يستقبل الإيميلات والرسائل الإعلانيّة».
   *
   * وتبقى `optional` لأنّ الموافقةَ التي يمنعك رفضُها من التسجيل ليست موافقة. ومربّعُها
   * يبدأ **فارغاً**: المربّعُ المعبّأ سلفاً لا يُعدّ قبولاً في أيّ معيارٍ للخصوصيّة.
   */
  marketingConsent: z.boolean().optional().default(false),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
