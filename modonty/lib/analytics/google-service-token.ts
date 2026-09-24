import { createSign } from "node:crypto";

/**
 * Access token for a Google service account — signed JWT → OAuth token, cached per
 * account + scope until a minute before it expires.
 *
 * GA4 (`ga4.ts`) and Search Console (`search-console-totals.ts`) use different accounts
 * and scopes; one signer for both instead of two copies of the same crypto.
 * No `googleapis` here on purpose: the whole SDK for one POST is weight the public site
 * does not need.
 */
const cache = new Map<string, { token: string; expiresAt: number }>();

function base64url(data: string | Buffer): string {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function getGoogleServiceToken(clientEmail: string, privateKey: string, scope: string): Promise<string> {
  const key = `${clientEmail}|${scope}`;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now() + 60_000) return hit.token;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ iss: clientEmail, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }),
  );
  const toSign = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(toSign);
  const jwt = `${toSign}.${base64url(signer.sign(privateKey))}`;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const data = (await resp.json()) as { access_token?: string; expires_in?: number };
  if (!resp.ok || !data.access_token) throw new Error(`Google token HTTP ${resp.status}`);
  cache.set(key, { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 });
  return data.access_token;
}
