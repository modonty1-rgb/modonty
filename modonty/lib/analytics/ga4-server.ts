/**
 * GA4 Measurement Protocol — server-side event sender
 *
 * Fire-and-forget pattern: never blocks the caller, never throws.
 * Used by Server Actions + Route Handlers to track engagement events.
 *
 * Docs: https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */

const GA4_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const GA4_DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const API_SECRET = process.env.GA4_API_SECRET;

type GA4EventParams = Record<string, string | number | boolean | null | undefined>;

interface SendOptions {
  userId?: string;
  debug?: boolean;
  timeoutMs?: number;
}

interface GA4Payload {
  client_id: string;
  user_id?: string;
  events: Array<{
    name: string;
    params: GA4EventParams & {
      session_id: string;
      engagement_time_msec: number;
    };
  }>;
}

function sanitizeParams(params: GA4EventParams): GA4EventParams {
  const out: GA4EventParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string" && v.length > 500) {
      out[k] = v.slice(0, 500);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Send a single GA4 event via Measurement Protocol.
 * Fire-and-forget — never throws, never blocks origin flow.
 *
 * @param eventName snake_case event name (max 40 chars per GA4 limit)
 * @param clientId  visitor id (from _ga cookie or mdy_vid fallback)
 * @param sessionId session id (from getSessionId helper)
 * @param params    event params (max 25 per event, snake_case keys ≤ 40 chars)
 * @param options   userId for cross-device, debug=true to hit /debug endpoint
 */
export function sendGA4Event(
  eventName: string,
  clientId: string,
  sessionId: string,
  params: GA4EventParams = {},
  options: SendOptions = {},
): void {
  if (!MEASUREMENT_ID || !API_SECRET) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[ga4-server] GA4 env vars missing — event dropped:", eventName);
    }
    return;
  }

  // GA4 DebugView: auto-enable in non-production so dev events appear in
  // Admin → DebugView (per official GA4 docs). Does NOT affect prod reports.
  const isDev = process.env.NODE_ENV !== "production";

  const payload: GA4Payload = {
    client_id: clientId,
    events: [
      {
        name: eventName,
        params: {
          ...sanitizeParams(params),
          session_id: sessionId,
          engagement_time_msec: 100,
          ...(isDev ? { debug_mode: 1 } : {}),
        },
      },
    ],
  };

  if (options.userId) payload.user_id = options.userId;

  const endpoint = options.debug ? GA4_DEBUG_ENDPOINT : GA4_ENDPOINT;
  const url = `${endpoint}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 3000);

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
    keepalive: true,
  })
    .then(async (resp) => {
      if (isDev) {
        // Dev-only confirmation log — verify events reach GA4 during local testing
        console.log(`[ga4-server] ${eventName} → HTTP ${resp.status}${resp.ok ? "" : " ⚠️"}`);
      }
      if (options.debug) {
        const json = await resp.json().catch(() => null);
        if (json?.validationMessages?.length) {
          console.warn(`[ga4-server] validation errors for ${eventName}:`, json.validationMessages);
        }
      }
    })
    .catch(() => {
      // Silent — analytics must never break origin flow
    })
    .finally(() => clearTimeout(timeout));
}

/**
 * Async variant that returns a Promise — only for use in validation/debug scripts.
 * Production code should use sendGA4Event (fire-and-forget).
 */
export async function sendGA4EventAwait(
  eventName: string,
  clientId: string,
  sessionId: string,
  params: GA4EventParams = {},
  options: SendOptions = {},
): Promise<{ ok: boolean; status: number; validationMessages?: unknown[] }> {
  if (!MEASUREMENT_ID || !API_SECRET) {
    return { ok: false, status: 0 };
  }

  const payload: GA4Payload = {
    client_id: clientId,
    events: [
      {
        name: eventName,
        params: {
          ...sanitizeParams(params),
          session_id: sessionId,
          engagement_time_msec: 100,
        },
      },
    ],
  };

  if (options.userId) payload.user_id = options.userId;

  const endpoint = options.debug ? GA4_DEBUG_ENDPOINT : GA4_ENDPOINT;
  const url = `${endpoint}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (options.debug) {
      const json = (await resp.json().catch(() => null)) as
        | { validationMessages?: unknown[] }
        | null;
      return { ok: resp.ok, status: resp.status, validationMessages: json?.validationMessages ?? [] };
    }
    return { ok: resp.ok, status: resp.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
