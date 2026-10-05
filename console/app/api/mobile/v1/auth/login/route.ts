import bcrypt from "bcryptjs";
import { z } from "zod";
import { findClientByIdentifier } from "@/lib/find-client-by-identifier";
import { mobileTokenTtlSeconds, startMobileSession } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { clearLoginFailures, clientIp, loginBlockedForSeconds, loginThrottleKey, recordLoginFailure } from "@/lib/mobile-api/login-throttle";
import { readBody } from "@/lib/mobile-api/request";

/**
 * المعرّف بريدٌ **أو** اسم الحساب (slug)، بلا حساسيّة لحالة الأحرف — نفس قاعدة دخول الويب
 * لأنّ الاثنين يناديان `findClientByIdentifier`. وكانت النقطة تشترط `.email()` وتطابق
 * البريد حرفياً، فـ`Support@…` أو اسم الحساب يُرفضان هنا ويُقبلان على الويب.
 *
 * الحقل `identifier`، و`email` مقبول للتوافق مع نسخ التطبيق الحالية (يُرسل `email`).
 */
const loginInput = z
  .object({
    identifier: z.string().trim().min(1).max(320).optional(),
    email: z.string().trim().min(1).max(320).optional(),
    password: z.string().min(1).max(256),
  })
  .refine((value) => Boolean(value.identifier || value.email), { message: "اكتب البريد أو اسم الحساب.", path: ["identifier"] });

export async function POST(request: Request) {
  const parsed = await readBody(request as never, loginInput);
  if ("response" in parsed) return parsed.response;
  const identifier = (parsed.value.identifier || parsed.value.email) as string;
  const { password } = parsed.value;

  const throttleKey = loginThrottleKey(identifier, clientIp(request));
  const blockedFor = await loginBlockedForSeconds(throttleKey);
  if (blockedFor !== null) {
    const response = fail("RATE_LIMITED", "محاولات دخول كثيرة. جرّب بعد ربع ساعة.");
    response.headers.set("Retry-After", String(blockedFor));
    return response;
  }

  const client = await findClientByIdentifier(identifier);
  if (!client?.password || !(await bcrypt.compare(password, client.password))) {
    await recordLoginFailure(throttleKey);
    return fail("UNAUTHORIZED", "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  }
  await clearLoginFailures(throttleKey);

  const token = await startMobileSession({ clientId: client.id, name: client.name, slug: client.slug, email: client.email });
  return ok({ accessToken: token, tokenType: "Bearer", expiresIn: mobileTokenTtlSeconds, client: { id: client.id, name: client.name, slug: client.slug, email: client.email } });
}
