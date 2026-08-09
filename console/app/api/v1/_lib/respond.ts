import { createHash } from "node:crypto";

/**
 * ETag + rate limit — the two things that keep a client's traffic from becoming ours.
 *
 * Their site pulls on every cache miss, and a busy site misses often. Without an ETag
 * every one of those calls ships the full body of every article; with one, an unchanged
 * list costs a 304 and no body at all.
 */

export function jsonWithEtag(request: Request, body: unknown, maxAgeSeconds = 3600): Response {
  const payload = JSON.stringify(body);
  const etag = `"${createHash("sha1").update(payload).digest("base64url")}"`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    ETag: etag,
    "Cache-Control": `public, max-age=${maxAgeSeconds}, must-revalidate`,
  };

  // A conditional request that matches gets no body — this is the whole saving.
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch.split(",").some((v) => v.trim() === etag)) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(payload, { status: 200, headers });
}

export function jsonError(status: number, error: string, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders },
  });
}

/**
 * Rate limit, per key, in memory.
 *
 * Deliberately not a shared store: this is a guard against a broken loop on one client's
 * server hammering us, not a billing meter. Per-instance counting is enough for that,
 * and it costs no infrastructure — if it ever needs to be exact, that is the day to add
 * one, not before.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 120;
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(clientId: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const entry = hits.get(clientId);

  if (!entry || now >= entry.resetAt) {
    hits.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (entry.count >= MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true };
}
