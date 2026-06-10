// Admin → Client console access (impersonation handoff).
//
// The admin app SIGNS a short-lived token; the console app VERIFIES it with the
// SAME shared secret (ADMIN_CONSOLE_ACCESS_SECRET in .env.shared). No password,
// no decryption of the client's credentials — just a signed, expiring "ticket".
//
// Token format: base64url(JSON({ clientId, exp })) + "." + base64url(HMAC-SHA256(payload))
// Keep this algorithm byte-identical to console/lib/admin-access.ts (the verifier).

import { createHmac } from "crypto";

const SECRET = process.env.ADMIN_CONSOLE_ACCESS_SECRET;

/** Sign a short-lived admin→console access ticket for one client (default 60s). */
export function signConsoleAccessToken(clientId: string, ttlSeconds = 60): string {
  if (!SECRET) throw new Error("ADMIN_CONSOLE_ACCESS_SECRET is not set");
  const payload = { clientId, exp: Date.now() + ttlSeconds * 1000 };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

/** Build the full console handoff URL for a client. */
export function buildConsoleAccessUrl(clientId: string): string {
  const base = (process.env.CONSOLE_BASE_URL ?? "https://console.modonty.com").replace(/\/$/, "");
  const token = signConsoleAccessToken(clientId);
  return `${base}/admin-access?token=${encodeURIComponent(token)}`;
}
