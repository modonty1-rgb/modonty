import { ConversionType } from "@prisma/client";

import { createConversion } from "@/lib/analytics/conversion-tracking";
import { trackSignupComplete } from "@/lib/analytics/events-registry";

/**
 * أثر «حساب جديد عبر مزوّد خارجي» — **مصدر واحد** لبابين: حدث Auth.js `events.createUser`
 * في الويب (`lib/auth.ts`، أوّل دخول بجوجل) ونقطتا التطبيق `/api/mobile/v1/auth/{google,apple}`
 * حين تُنشئان مستخدماً. نُقل جسم الحدث كما هو: تحويل SIGNUP + GA4 `signup_complete`.
 *
 * حسابات البريد وكلمة المرور تُنشأ في `registerUser` الذي يعدّ `signup_complete` بنفسه — فلا عدّ مزدوج.
 * لا يرمي أبداً: فشل التتبّع لا يوقف الدخول (كما كان في الحدث)، والخطأ يُسجَّل بدل الكتمان.
 */
export async function recordOAuthSignup(
  userId: string,
  method: "google" | "apple",
  source: "page" | "app",
): Promise<void> {
  try {
    await createConversion({ type: ConversionType.SIGNUP, userId });
    void trackSignupComplete({ signup_method: method, signup_source: source }, { userId });
  } catch (error) {
    console.error("[auth:oauth-signup]", error);
  }
}
