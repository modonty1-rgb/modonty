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

/**
 * The whole-site ceiling. The per-account limit above caps one member; it cannot cap the bill,
 * because an anonymous visitor holds their trial in a cookie they can delete and start over.
 *
 * The default is a placeholder, not a measurement — the real cost of one question in riyals is
 * still unknown (embedding and rerank prices are not published per call). Set
 * `MODO_DAILY_QUESTION_CAP` once a real invoice exists.
 */
const SITE_MAX_PER_DAY = Number(process.env.MODO_DAILY_QUESTION_CAP) || 2000;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export interface RateLimitVerdict {
  allowed: boolean;
  /** Arabic message ready to show the visitor — empty when allowed. */
  message: string;
  /** Seconds until they may ask again — for the `Retry-After` header. */
  retryAfterSeconds: number;
}

/**
 * Runs for every question, signed in or not. `userId` is null for a trial visitor: they have no
 * per-account history to count, but they still count against the site ceiling.
 */
export async function checkRateLimit(userId: string | null, now: Date): Promise<RateLimitVerdict> {
  const dayAgo = new Date(now.getTime() - DAY_MS);

  const [lastHour, lastDay, siteLastDay] = await Promise.all([
    userId
      ? db.chatbotMessage.count({
          where: { userId, createdAt: { gte: new Date(now.getTime() - HOUR_MS) } },
        })
      : Promise.resolve(0),
    userId ? db.chatbotMessage.count({ where: { userId, createdAt: { gte: dayAgo } } }) : Promise.resolve(0),
    db.chatbotMessage.count({ where: { createdAt: { gte: dayAgo } } }),
  ]);

  // Checked first: it protects the account that owns the bill, not the visitor in front of us.
  if (siteLastDay >= SITE_MAX_PER_DAY) {
    return {
      allowed: false,
      message: "مودو مشغول جداً اليوم. جرّب بعد شوي.",
      retryAfterSeconds: 3600,
    };
  }

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
