import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Deciding whether a webhook really came from Tamara.
 *
 * This lives apart from the route because it is the one piece that can be checked without
 * a network, a database, or a payment: given a secret and a string, it either accepts or
 * it does not. Code that guards money should be runnable in isolation, and a function
 * buried in a request handler is not.
 *
 * It takes the secret as an argument and imports no `server-only`, deliberately — that is
 * what lets `scripts/verify-tamara-token.ts` run the real function rather than a copy of
 * it that could drift. It reads no environment and holds no state, so nothing leaks by
 * being importable.
 *
 * The token is a JWT signed HS256 with the notification secret Tamara issues per merchant.
 */

export type TokenVerdict = { ok: true } | { ok: false; reason: string };

function b64url(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

export function verifyTamaraToken(token: string, secret: string): TokenVerdict {
  if (!secret) return { ok: false, reason: "no-secret-configured" };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  const [headerB64, payloadB64, signatureB64] = parts;

  let header: { alg?: string };
  let payload: { iss?: string; exp?: number };
  try {
    header = JSON.parse(b64url(headerB64).toString()) as { alg?: string };
    payload = JSON.parse(b64url(payloadB64).toString()) as { iss?: string; exp?: number };
  } catch {
    return { ok: false, reason: "undecodable" };
  }

  // The algorithm is our decision, not the token's. Trusting the `alg` header is how
  // "alg: none" and HMAC-vs-RSA confusion attacks work: the attacker picks the algorithm,
  // then satisfies it. Pinning HS256 means an attacker must produce an HS256 signature,
  // which requires the secret.
  if (header.alg !== "HS256") return { ok: false, reason: `alg-${header.alg}` };

  const expected = createHmac("sha256", secret).update(`${headerB64}.${payloadB64}`).digest();
  const provided = b64url(signatureB64);
  // Length is checked first because timingSafeEqual throws on a mismatch, and the length
  // of a signature is not a secret.
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return { ok: false, reason: "bad-signature" };
  }

  if (payload.iss !== "Tamara") return { ok: false, reason: `iss-${payload.iss}` };
  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true };
}
