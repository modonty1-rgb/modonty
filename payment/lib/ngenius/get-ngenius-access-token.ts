/**
 * N-Genius access token — module-scoped cache.
 *
 * Tokens expire after 5 minutes per the docs. We cache and reuse within a
 * 30-second safety window before expiry to avoid mid-request expiration.
 * Cache lives in the serverless instance memory — worst case a cold start
 * costs one extra auth call, cheap and safe.
 */

const TOKEN_URL = process.env.NGENIUS_TOKEN_URL
  ?? "https://api-gateway.sandbox.ksa.ngenius-payments.com/identity/auth/access-token";

type CachedToken = { value: string; expiresAt: number };
let cache: CachedToken | null = null;
let inFlight: Promise<string> | null = null; // dedupes concurrent requests

async function fetchNewToken(): Promise<string> {
  const apiKey = process.env.NGENIUS_API_KEY;
  if (!apiKey) throw new Error("NGENIUS_API_KEY is not set");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6_000);
  let res: Response;
  try {
    res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.ni-identity.v1+json",
        Accept: "application/vnd.ni-identity.v1+json",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({ grant_type: "client_credentials", realm: "ni" }),
      cache: "no-store",
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const reason = err instanceof Error ? err.name + ": " + err.message : String(err);
    throw new Error(`N-Genius auth network error (url=${TOKEN_URL}): ${reason}`);
  }
  clearTimeout(timer);

  if (!res.ok) {
    const detail = await res.text().catch(() => "<no body>");
    throw new Error(`N-Genius auth failed: ${res.status} ${detail.slice(0, 200)}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number; token_type: string };
  if (!data.access_token) {
    throw new Error("N-Genius auth: response missing access_token");
  }

  cache = {
    value: data.access_token,
    // Refresh 30s early to survive network jitter on subsequent calls.
    expiresAt: Date.now() + (data.expires_in * 1000) - 30_000,
  };
  return data.access_token;
}

export async function getNGeniusAccessToken(): Promise<string> {
  if (cache && Date.now() < cache.expiresAt) return cache.value;
  if (inFlight) return inFlight; // dedupe concurrent misses
  inFlight = fetchNewToken().finally(() => { inFlight = null; });
  return inFlight;
}

/** Test-only: clears cached token. Do not use in production code. */
export function __resetNGeniusAuthCacheForTests(): void {
  cache = null;
  inFlight = null;
}
