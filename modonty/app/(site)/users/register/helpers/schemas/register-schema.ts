import { z } from "zod";

import { passwordField } from "@/lib/auth/password-rule";
import { ALERT_TOPIC_IDS } from "@/lib/users/alert-topics";

export const registerSchema = z.object({
  // Asked on the form: without it the account had no name and the header showed the first letter
  // of the email (QA finding #2, 29 Sep 2026). Google sign-ups still get theirs from Google.
  name: z.string().trim().min(2, "اكتب اسمك (حرفان على الأقل)").max(100, "الاسم طويل جداً"),
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

  /** The topic the reader ticked «نبّهني» for, when a page sent them here with `?alert=<id>`. */
  alertTopic: z.enum(ALERT_TOPIC_IDS).optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
