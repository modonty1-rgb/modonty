import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

/**
 * التحقّق من البريد وكلمة المرور — **مصدر واحد** لبابي الدخول: مزوّد Credentials في الويب
 * (`auth.config.ts`) ونقطة دخول تطبيق القارئ (`/api/mobile/v1/auth/login`). نُقل من جسم
 * `authorize` كما هو؛ لا قاعدة ثانية.
 *
 * يُرجع المستخدم أو `null` (حساب غير موجود · بلا كلمة مرور · كلمة خاطئة). يرمي فقط على عطل قاعدة.
 */
export async function verifyCredentials(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image || user.avatar,
  };
}
