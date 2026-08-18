import "server-only";

import { db } from "@/lib/db";

/**
 * Every Modo question costs money upstream (embed + rerank + generation, sometimes web search).
 * Without a ceiling one account can loop the endpoint and burn the whole budget, so the limit is
 * enforced here on the server — never in the browser, which the caller controls.
 *
 * The counter reads the conversation log itself rather than a second collection: a saved turn IS
 * a paid turn, so the numbers cannot drift apart.
 */
const MAX_PER_HOUR = 20;
const MAX_PER_DAY = 100;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export interface RateLimitVerdict {
  allowed: boolean;
  /** Arabic message ready to show the visitor — empty when allowed. */
  message: string;
  /** Seconds until they may ask again — for the `Retry-After` header. */
  retryAfterSeconds: number;
}

export async function checkRateLimit(userId: string, now: Date): Promise<RateLimitVerdict> {
  const [lastHour, lastDay] = await Promise.all([
    db.chatbotMessage.count({
      where: { userId, createdAt: { gte: new Date(now.getTime() - HOUR_MS) } },
    }),
    db.chatbotMessage.count({
      where: { userId, createdAt: { gte: new Date(now.getTime() - DAY_MS) } },
    }),
  ]);

  if (lastDay >= MAX_PER_DAY) {
    return {
      allowed: false,
      message: "وصلت الحدّ اليومي للأسئلة. ارجع لي بكرة وأكمل معك.",
      retryAfterSeconds: Math.ceil(DAY_MS / 1000),
    };
  }

  if (lastHour >= MAX_PER_HOUR) {
    return {
      allowed: false,
      message: "أسئلتك كثيرة في وقت قصير. استريح شوي وارجع بعد ساعة.",
      retryAfterSeconds: Math.ceil(HOUR_MS / 1000),
    };
  }

  return { allowed: true, message: "", retryAfterSeconds: 0 };
}
