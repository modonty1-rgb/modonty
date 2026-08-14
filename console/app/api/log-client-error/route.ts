import { NextRequest, NextResponse } from "next/server";

import { enrichError } from "@modonty/shared/lib/system-error/enrich";

export const runtime = "nodejs";

/**
 * The browser's way into the shared SystemError log.
 *
 * `instrumentation.onRequestError` only ever sees errors Next threw on the server. A
 * component that crashes in the browser — a bad `.map()` on undefined, a third-party
 * script, a hydration mismatch — was landing the client on the error screen and leaving
 * no trace anywhere. This closes that half.
 *
 * It exists as a route rather than a direct call because `INTERNAL_LOG_SECRET` must stay
 * on the server. That makes the endpoint public, so it is bounded on every axis it can be
 * abused through: body size, field length, and requests per IP.
 */

const MAX_BODY_BYTES = 4000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

// Per-instance, and therefore best-effort — serverless hands out no shared memory. This is
// not a security boundary; it is a circuit breaker for the failure that actually happens:
// a component that throws on every render and reports itself in a loop.
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, now: number): boolean {
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Every path answers 200. The caller is an error screen — a failure here must never
  // become a second error stacked on the one the client is already looking at.
  const ok = NextResponse.json({ ok: true });

  // Production only — the sink is the production admin, and `.env.shared` carries the
  // secret into dev too, so checking for the secret alone would not keep dev noise out.
  if (process.env.VERCEL_ENV !== "production") return ok;

  const secret = process.env.INTERNAL_LOG_SECRET;
  if (!secret) return ok;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip, Date.now())) return ok;

  let payload: { message?: unknown; path?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return ok;
    payload = JSON.parse(raw) as { message?: unknown; path?: unknown };
  } catch {
    return ok;
  }

  const message = typeof payload.message === "string" ? payload.message.trim().slice(0, 500) : "";
  if (!message) return ok;
  const path = typeof payload.path === "string" ? payload.path.slice(0, 500) : "/";

  // Passed explicitly rather than dumping every header — these three are the only ones
  // `enrichError` reads, and naming them keeps the rest of the request out of the log.
  const meta = enrichError(
    {
      "user-agent": request.headers.get("user-agent") ?? undefined,
      "x-vercel-ip-country": request.headers.get("x-vercel-ip-country") ?? undefined,
      "x-vercel-ip-city": request.headers.get("x-vercel-ip-city") ?? undefined,
    },
    message,
    null,
  );

  try {
    await fetch("https://admin.modonty.com/api/internal/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": secret,
      },
      body: JSON.stringify({
        message,
        // Never a digest here — that marker belongs to server errors, which are already
        // logged by instrumentation. Its absence is what routed the error to this file.
        digest: null,
        path,
        method: "GET",
        routePath: path,
        // Distinguishes a browser crash from a server render failure in /system-errors.
        routeType: "client-render",
        source: "console:client",
        category: meta.category,
        device: meta.device,
        botName: meta.botName,
        country: meta.country,
        city: meta.city,
        userAgent: meta.userAgent,
      }),
      signal: AbortSignal.timeout(2500),
    });
  } catch {
    // never let error logging become an error
  }

  return ok;
}
