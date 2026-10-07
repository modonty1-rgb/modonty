import { db } from "@/lib/db";

/**
 * حدّ محاولات دخول الجوّال: ٥ محاولات فاشلة خلال ١٥ دقيقة لنفس (المعرّف + العنوان) → 429.
 *
 * في القاعدة لا في الذاكرة: على Vercel كل نداء قد يصل نسخة جديدة من الدالّة، فعدّادٌ في
 * الذاكرة (مثل `api/v1/_lib/respond.ts`) يبدأ من صفر في كل نسخة ولا يوقف تخميناً موزّعاً.
 * والمفتاح يجمع المعرّف والعنوان: المعرّف وحده يسمح لأيّ أحد أن يقفل حساب غيره.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function loginThrottleKey(identifier: string, ip: string): string {
  return `${identifier.trim().toLowerCase()}|${ip}`;
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
  // تنظيف خفيف: ما خرج من النافذة لا يُعدّ، فلا داعي لبقائه.
  await db.mobileLoginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - WINDOW_MS) } } });
}

export async function clearLoginFailures(key: string): Promise<void> {
  await db.mobileLoginAttempt.deleteMany({ where: { key } });
}
