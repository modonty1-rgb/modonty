import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * حدود المعدّل — Upstash Redis، عميلٌ واحد وثلاث سياسات بأسماء مختلفة
 * (`rl:checkout:<ip>` · `rl:order:<ip>` · `rl:status:<ip>`).
 *
 * منقولة من جبر سيو. لماذا Redis لا ذاكرة العملية: مدونتي تعمل على Vercel، وكل طلبٍ قد
 * يقع على نسخةٍ أخرى — فعدّادٌ في الذاكرة يعني أن مُجرِّب البطاقات يحصل على ثلاث محاولات
 * **لكل نسخة**، أي بلا حدٍّ عملي. (المسار الوحيد الذي يكتفي بالذاكرة هو `log-failure`
 * لأنه لا يلمس مالاً ولا قاعدة.)
 *
 * بلا مفاتيح Upstash: حدٌّ لا يفعل شيئاً — وهذا مقصود للتطوير والساندبوكس. يبقى بندٌ
 * مفتوحاً: قبل أوّل بيع حقيقي يجب أن تُضاف المفاتيح، وإلا فالمسار الذي يُنشئ طلباً
 * ويحاول دفعةً مفتوحٌ بلا سقف.
 */

function makeRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = makeRedis();

export type LimiterResult = { success: boolean; limit: number; remaining: number; reset: number };

const NOOP_LIMIT: LimiterResult = { success: true, limit: Infinity, remaining: Infinity, reset: 0 };

/** True حين تكون الحدود فعّالة حقاً — تُقرأ في فحص الجاهزية قبل الإطلاق. */
export function rateLimitingIsConfigured(): boolean {
  return redis !== null;
}

function build(prefix: string, limit: number, windowSec: number) {
  if (!redis) return { limit: async (): Promise<LimiterResult> => NOOP_LIMIT };
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: true,
    prefix: `rl:${prefix}`,
  });
  return {
    limit: async (key: string): Promise<LimiterResult> => {
      const r = await rl.limit(key);
      return { success: r.success, limit: r.limit, remaining: r.remaining, reset: r.reset };
    },
  };
}

/** صفحة الدفع — هدفٌ عالي القيمة، فالسقف ضيّق. */
export const checkoutLimiter = build("checkout", 5, 600); // ٥ / ١٠ دقائق / IP

/** إنشاء طلبٍ ومحاولة دفعة — الأضيق: هذا بالضبط ما يُستغلّ لتجريب البطاقات بالجملة. */
export const orderLimiter = build("order", 3, 60); // ٣ / دقيقة / IP

/** الاستعلام عن حالة طلب — يُنادى بالتكرار من شاشة الانتظار، فسقفه أوسع. */
export const statusLimiter = build("status", 60, 60); // ٦٠ / دقيقة / IP
