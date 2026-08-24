import "server-only";

/**
 * The signup endpoint is public and its side effect is an outbound email to whatever address
 * the body carries. Without a ceiling a script loops it with a list of strangers' addresses
 * and every one of them receives mail from our sending domain — they mark it spam, and the
 * domain's reputation is spent on everyone else's newsletter too.
 *
 * Per-instance memory, so it is best-effort on serverless: it stops the loop, it is not an
 * identity boundary. The durable half is `NewsSubscriber.email` being unique — the same
 * address never triggers a second welcome mail no matter how often it is posted.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const hits = new Map<string, { count: number; resetAt: number }>();

export function isSubscribeRateLimited(ip: string, now: number): boolean {
  hits.forEach((entry, key) => {
    if (entry.resetAt <= now) hits.delete(key);
  });

  const entry = hits.get(ip);
  if (!entry) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}
