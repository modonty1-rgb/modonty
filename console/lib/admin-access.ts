// Console verifier for the admin → client console access handoff.
//
// Verifies the signed, expiring ticket minted by admin/lib/console-access.ts using
// the SAME shared secret (ADMIN_CONSOLE_ACCESS_SECRET in .env.shared). Constant-time
// signature compare + expiry check. Returns the clientId only when fully valid.
// Keep this algorithm byte-identical to admin/lib/console-access.ts (the signer).

import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.ADMIN_CONSOLE_ACCESS_SECRET;

export function verifyConsoleAccessToken(token: string): { clientId: string } | null {
  if (!SECRET || !token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;

  // Signature check (constant-time).
  const expected = createHmac("sha256", SECRET).update(payloadB64).digest();
  const provided = Buffer.from(sig, "base64url");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  // Payload + expiry check.
  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as { clientId?: string; exp?: number };
    if (!payload.clientId || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return { clientId: payload.clientId };
  } catch {
    return null;
  }
}
