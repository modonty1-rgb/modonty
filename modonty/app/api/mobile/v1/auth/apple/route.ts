import { z } from "zod";

import { fail, handle } from "@/lib/mobile-api/http";
import { finishSocialSignIn } from "@/lib/mobile-api/finish-social-sign-in";
import { ACCOUNT_MESSAGES } from "@/lib/mobile-api/messages-account";
import { readBody } from "@/lib/mobile-api/request";
import { verifyAppleIdentityToken } from "@/lib/mobile-api/verify-apple-identity-token";

const namePart = z.string().trim().max(100).nullish();

const bodySchema = z.object({
  identityToken: z.string().min(20).max(4096),
  /** The nonce the app passed to `signInAsync` — checked against the token's `nonce` claim when sent. */
  nonce: z.string().min(8).max(256).optional(),
  /** Apple returns the name to the app on the FIRST authorization only — it is never in the token. */
  fullName: z.object({ givenName: namePart, familyName: namePart }).nullish(),
  deviceId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/).optional(),
});

/**
 * A4 — POST /api/mobile/v1/auth/apple · public. Required on iOS next to Google (App Store 4.8).
 * `expo-apple-authentication` → `identityToken`, verified against Apple's JWKS (`jose`), issuer
 * `https://appleid.apple.com`, audience = the app's bundle ID. Then the same find/link/create rule as
 * Google (`signInOAuthIdentity`, Account provider `apple`). The name is stored only when the account is
 * created (or the row has none) — Apple sends it once.
 * → `{ accessToken, refreshToken, expiresIn, user, isNewUser }` (201 when the account is new).
 */
export const POST = handle("auth-apple", async (request: Request) => {
  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;
  const { identityToken, nonce, fullName, deviceId } = body.value;

  const name = [fullName?.givenName, fullName?.familyName].filter(Boolean).join(" ").trim() || null;
  const verified = await verifyAppleIdentityToken(identityToken, nonce, name);
  if (!verified.ok) {
    return verified.reason === "not_configured"
      ? fail("INTERNAL_ERROR", ACCOUNT_MESSAGES.socialNotConfigured)
      : fail("UNAUTHORIZED", ACCOUNT_MESSAGES.appleFailed);
  }

  return finishSocialSignIn(request, verified.identity, deviceId, ACCOUNT_MESSAGES.appleFailed);
});
