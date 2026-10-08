import { db } from "@/lib/db";

/**
 * حدّ محاولات دخول القارئ من التطبيق: ٥ فشل خلال ١٥ دقيقة لنفس (البريد + العنوان) → 429.
 *
 * نفس منطق `console/lib/mobile-api/login-throttle.ts` وعلى **نفس الجدول** (`MobileLoginAttempt`):
 * الجدول مفتاحٌ ووقت فقط، والبادئة `reader:` تفصل مفاتيح القرّاء عن مفاتيح العملاء. في القاعدة
 * لا في الذاكرة — على Vercel كل نداء قد يصل نسخة جديدة فيبدأ عدّاد الذاكرة من صفر.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const KEY_PREFIX = "reader:";

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function loginThrottleKey(email: string, ip: string): string {
  return `${KEY_PREFIX}${email.trim().toLowerCase()}|${ip}`;
}

/** كم ثانية باقية على الحظر، أو `null` لو المحاولة مسموحة. */
export async function loginBlockedForSeconds(key: string): Promise<number | null> {
  const since = new Date(Date.now() - WINDOW_MS);
  const failures = await db.mobileLoginAttempt.findMany({
    where: { key, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
    take: MAX_FAILURES,
  });
  if (failures.length < MAX_FAILURES) return null;
  const oldest = failures[0].createdAt.getTime();
  return Math.max(1, Math.ceil((oldest + WINDOW_MS - Date.now()) / 1000));
}

export async function recordLoginFailure(key: string): Promise<void> {
  await db.mobileLoginAttempt.create({ data: { key } });
  // تنظيف خفيف لمفاتيح القرّاء وحدها — ما خرج من النافذة لا يُعدّ.
  await db.mobileLoginAttempt.deleteMany({
    where: { key: { startsWith: KEY_PREFIX }, createdAt: { lt: new Date(Date.now() - WINDOW_MS) } },
  });
}

export async function clearLoginFailures(key: string): Promise<void> {
  await db.mobileLoginAttempt.deleteMany({ where: { key } });
}
