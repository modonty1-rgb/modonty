import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, errors, jwtVerify } from "jose";

import type { VerifiedOAuthIdentity } from "@/lib/auth/sign-in-oauth-identity";

/** Apple's public signing keys and issuer for Sign in with Apple identity tokens. */
const APPLE_ISSUER = "https://appleid.apple.com";
// Module-level: jose caches the fetched JWKS and refetches on an unknown `kid` (cooldown 30s).
const appleKeys = createRemoteJWKSet(new URL(`${APPLE_ISSUER}/auth/keys`));

/** `aud` = the iOS bundle ID (native sign-in) or the Services ID (web/Android flow). Names only. */
function appleAudiences(): string[] {
  return [process.env.APPLE_BUNDLE_ID, process.env.APPLE_SERVICE_ID].filter((v): v is string => !!v);
}

function sameText(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * expo-apple-authentication passes `nonce` to `ASAuthorizationAppleIDRequest.nonce` unmodified
 * (ios/AppleAuthenticationRequest.swift:31) and Apple echoes the request's value in the token's
 * `nonce` claim. Apps commonly send SHA-256(raw) to Apple and keep the raw value (the Firebase /
 * Supabase pattern), so the claim may equal the value we receive or its SHA-256 hex.
 */
function nonceMatches(claim: unknown, nonce: string): boolean {
  if (typeof claim !== "string") return false;
  return sameText(claim, nonce) || sameText(claim, createHash("sha256").update(nonce).digest("hex"));
}

export type AppleVerifyResult =
  | { ok: true; identity: VerifiedOAuthIdentity }
  | { ok: false; reason: "not_configured" | "invalid" };

/**
 * jose `jwtVerify(jwt, createRemoteJWKSet(url), { issuer, audience })` (d.ts: `JWTClaimVerificationOptions
 * { audience?: string | string[]; issuer?: string | string[]; … }`) checks the RS256 signature against
 * Apple's JWKS, `iss`, `aud` and `exp`. Bad tokens → `invalid`; a JWKS outage (network, timeout)
 * is rethrown so `handle()` answers 500 instead of blaming the reader.
 */
export async function verifyAppleIdentityToken(
  identityToken: string,
  nonce: string | undefined,
  fullName: string | null,
): Promise<AppleVerifyResult> {
  const audience = appleAudiences();
  if (audience.length === 0) {
    console.error("[mobile-api:auth-apple] APPLE_BUNDLE_ID is not set");
    return { ok: false, reason: "not_configured" };
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(identityToken, appleKeys, { issuer: APPLE_ISSUER, audience, algorithms: ["RS256"] }));
  } catch (error) {
    const isTokenProblem =
      error instanceof errors.JOSEError && !(error instanceof errors.JWKSTimeout) && !(error instanceof errors.JWKSInvalid);
    if (!isTokenProblem) throw error;
    console.warn("[mobile-api:auth-apple] jwtVerify rejected", error.code);
    return { ok: false, reason: "invalid" };
  }

  if (typeof payload.sub !== "string" || !payload.sub) return { ok: false, reason: "invalid" };
  if (nonce !== undefined && !nonceMatches(payload.nonce, nonce)) {
    console.warn("[mobile-api:auth-apple] nonce mismatch");
    return { ok: false, reason: "invalid" };
  }

  // Apple sends `email_verified` as the string "true" or as a boolean.
  const emailVerified = payload.email_verified === true || payload.email_verified === "true";
  return {
    ok: true,
    identity: {
      provider: "apple",
      providerAccountId: payload.sub,
      email: typeof payload.email === "string" ? payload.email : null,
      emailVerified,
      name: fullName,
      image: null,
    },
  };
}
