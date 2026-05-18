/**
 * Visitor & Session ID resolution for GA4 server-side tracking.
 *
 * Strategy (hybrid):
 *   1. client_id  → prefer `_ga` cookie set by GTM (when present)
 *                   fallback to `mdy_vid` (server-set HTTP-only cookie)
 *   2. session_id → `mdy_sid` cookie with 30-min sliding TTL (matches GA4 default)
 *
 * Used by Server Actions + Route Handlers.
 */

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

const VISITOR_COOKIE = "mdy_vid";
const SESSION_COOKIE = "mdy_sid";
const GA_COOKIE = "_ga";

const VISITOR_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 years (matches _ga default)
const SESSION_MAX_AGE = 60 * 30; // 30 minutes (GA4 default session timeout)

/**
 * Parse the client_id from a `_ga` cookie value.
 * Format: `GA1.X.XXXXXXXXXX.XXXXXXXXXX` → return `XXXXXXXXXX.XXXXXXXXXX`
 */
function parseGaCookieClientId(gaCookie: string): string | null {
  const match = gaCookie.match(/^GA\d+\.\d+\.(\d+\.\d+)$/);
  return match ? match[1] : null;
}

/**
 * Resolve the visitor id for the current request.
 * Tries `_ga` first (set by GTM Config tag), falls back to `mdy_vid`.
 * If neither exists, creates `mdy_vid` and sets the cookie.
 *
 * Must be called from a Server Action or Route Handler context.
 */
export async function getOrCreateVisitorId(): Promise<string> {
  const store = await cookies();

  const ga = store.get(GA_COOKIE)?.value;
  if (ga) {
    const fromGa = parseGaCookieClientId(ga);
    if (fromGa) return fromGa;
  }

  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const newId = `${Date.now()}.${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  store.set(VISITOR_COOKIE, newId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: VISITOR_MAX_AGE,
    path: "/",
  });

  return newId;
}

/**
 * Resolve the session id for the current request.
 * 30-min sliding window — every event resets the cookie's Max-Age.
 *
 * Must be called from a Server Action or Route Handler context.
 */
export async function getSessionId(): Promise<string> {
  const store = await cookies();

  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) {
    store.set(SESSION_COOKIE, existing, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return existing;
  }

  const newId = String(Date.now());
  store.set(SESSION_COOKIE, newId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return newId;
}

/**
 * Convenience helper — resolves both ids in one call.
 */
export async function getVisitorContext(): Promise<{ clientId: string; sessionId: string }> {
  const [clientId, sessionId] = await Promise.all([getOrCreateVisitorId(), getSessionId()]);
  return { clientId, sessionId };
}
