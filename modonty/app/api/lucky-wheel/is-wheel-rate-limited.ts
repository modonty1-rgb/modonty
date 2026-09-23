import "server-only";

/**
 * A ceiling on spins per network, so a script cannot mint rows with invented phone numbers.
 *
 * Generous on purpose: at the event most visitors share the venue Wi-Fi, i.e. one address.
 * Per-instance memory, so best-effort on serverless — the durable rule is the unique
 * (campaign, phone) index, which caps every phone at one spin however often it is posted.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 60;

const hits = new Map<string, { count: number; resetAt: number }>();

export function isWheelRateLimited(ip: string, now: number): boolean {
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
