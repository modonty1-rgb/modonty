import "server-only";

/**
 * The one place that knows how to talk to Tamara.
 *
 * Everything else in `lib/tamara` builds payloads and reads answers; only this file holds
 * the base URL, the token and the shape of a failure. That split is what lets the sandbox
 * switch be a single environment variable instead of an edit.
 */

/**
 * Which Tamara we are talking to.
 *
 * `api-sandbox.tamara.co` is the test environment and `api.tamara.co` is the real one —
 * and a token is issued for exactly one of them. Asking the sandbox about a production
 * merchant answers `404 {"message":"Merchant is not found"}`, which is the cheapest way
 * to tell which kind of key you are holding.
 *
 * There is no default. A missing value must stop the request rather than silently pick an
 * environment, because the two differ by whether real money moves.
 */
export const TAMARA_API_URL = process.env.TAMARA_API_URL;

const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;

/** True when Tamara is configured at all — the checkout uses this to decide whether to offer it. */
export function tamaraIsConfigured(): boolean {
  return Boolean(TAMARA_API_URL && TAMARA_API_TOKEN);
}

/** True when we are pointed at the real environment, where a session is a real commitment. */
export function tamaraIsLive(): boolean {
  return Boolean(TAMARA_API_URL && !TAMARA_API_URL.includes("sandbox"));
}

/**
 * What Tamara sends back when it refuses.
 *
 * The `message` is written for a developer, not a customer — it says things like "We do
 * not support your delivery country". It belongs in our logs and never on a screen.
 */
export interface TamaraErrorBody {
  message?: string;
  errors?: { error_code?: string; error_message?: string }[];
}

export class TamaraError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
    message: string,
  ) {
    super(message);
    this.name = "TamaraError";
  }
}

/**
 * A single authenticated request.
 *
 * Throws `TamaraError` on any non-2xx so callers handle one failure type instead of
 * checking `res.ok` at every site. The timeout matters more here than in most fetches:
 * this runs inside a checkout POST that a customer is watching, and a gateway that hangs
 * must become a fast, honest error rather than a spinner that never ends.
 */
export async function tamaraRequest<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; timeoutMs?: number } = { method: "GET" },
): Promise<T> {
  if (!TAMARA_API_URL || !TAMARA_API_TOKEN) {
    throw new TamaraError(500, "not-configured", "TAMARA_API_URL / TAMARA_API_TOKEN missing");
  }

  const res = await fetch(`${TAMARA_API_URL}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${TAMARA_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(init.timeoutMs ?? 15_000),
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    let parsed: TamaraErrorBody = {};
    try {
      parsed = JSON.parse(text) as TamaraErrorBody;
    } catch {
      // Not JSON — an edge/proxy error page. Keep the raw text, truncated.
    }
    const code = parsed.errors?.[0]?.error_code || null;
    const message = parsed.message || text.slice(0, 300) || res.statusText;
    throw new TamaraError(res.status, code, message);
  }

  return JSON.parse(text) as T;
}
