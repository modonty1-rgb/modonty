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

import { cookies, headers } from "next/headers";
import { randomUUID } from "node:crypto";

const VISITOR_COOKIE = "mdy_vid";
const SESSION_COOKIE = "mdy_sid";
const GA_COOKIE = "_ga";

// The real GA4 session id (ga_session_id) lives in the `_ga_<container>` cookie set by
// gtag.js. The container suffix = the Measurement ID without the "G-" prefix
// (e.g. G-ABC123 → `_ga_ABC123`). Reading this so server-side Measurement Protocol events
// carry the SAME session_id as the browser → GA4 merges them into the online session
// (per official MP docs) instead of spawning a phantom "(not set)" session.
const GA_SESSION_COOKIE = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  ? `_ga_${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID.replace(/^G-/, "")}`
  : null;

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
 * Parse the real GA4 session id (ga_session_id) from the `_ga_<container>` cookie.
 * Handles both gtag formats — `GS1.1.<sid>.<count>…` (legacy) and
 * `GS2.0.s<sid>$o<n>$g<n>…` (current). The sid is a Unix-seconds timestamp.
 */
function parseGaSessionId(gaSessionCookie: string): string | null {
  const match = gaSessionCookie.match(/^GS\d+\.\d+\.s?(\d+)/);
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

  // 1. Prefer the REAL browser GA4 session id (`_ga_<container>` cookie). Matching it
  //    lets GA4 merge these server-side events into the online session (correct host +
  //    source) instead of creating a phantom "(not set)" session.
  if (GA_SESSION_COOKIE) {
    const gaSession = store.get(GA_SESSION_COOKIE)?.value;
    if (gaSession) {
      const realSessionId = parseGaSessionId(gaSession);
      if (realSessionId) return realSessionId;
    }
  }

  // 2. Fallback: server-set session cookie (when gtag hasn't set `_ga_<container>` yet —
  //    e.g. the very first request before the GA config tag runs). Seconds to match GA.
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

  const newId = String(Math.floor(Date.now() / 1000));
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
 * The page_location for the current event = the URL of the page that triggered this
 * server action / route handler (the `referer` header). GA4 needs it to attribute the
 * event to the right page + hostname instead of reporting "(not set)".
 */
export async function getPageLocation(): Promise<string | undefined> {
  const h = await headers();
  const referer = h.get("referer");
  return referer && /^https?:\/\//.test(referer) ? referer : undefined;
}

/**
 * Convenience helper — resolves visitor id, session id, and page_location in one call.
 */
export async function getVisitorContext(): Promise<{
  clientId: string;
  sessionId: string;
  pageLocation?: string;
}> {
  const [clientId, sessionId, pageLocation] = await Promise.all([
    getOrCreateVisitorId(),
    getSessionId(),
    getPageLocation(),
  ]);
  return { clientId, sessionId, pageLocation };
}
