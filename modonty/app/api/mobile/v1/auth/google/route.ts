import { z } from "zod";

import { fail, handle } from "@/lib/mobile-api/http";
import { finishSocialSignIn } from "@/lib/mobile-api/finish-social-sign-in";
import { ACCOUNT_MESSAGES } from "@/lib/mobile-api/messages-account";
import { readBody } from "@/lib/mobile-api/request";
import { verifyGoogleIdToken } from "@/lib/mobile-api/verify-google-id-token";

const bodySchema = z.object({
  idToken: z.string().min(20).max(4096),
  /** Same format as the X-Device-Id header (lib/mobile-api/device.ts); the header is used when absent. */
  deviceId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/).optional(),
});

/**
 * A3 — POST /api/mobile/v1/auth/google · public.
 * The app signs in natively (`@react-native-google-signin`) and sends the Google ID token. The
 * server verifies it (`verifyGoogleIdToken`), requires `email_verified`, then follows the web's
 * Google rule — Account by `sub`, else link by email (`allowDangerousEmailAccountLinking`), else a
 * new user with `events.createUser`'s side effects (`signInOAuthIdentity`) — and opens a reader session.
 * → `{ accessToken, refreshToken, expiresIn, user, isNewUser }` (201 when the account is new).
 */
export const POST = handle("auth-google", async (request: Request) => {
  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const verified = await verifyGoogleIdToken(body.value.idToken);
  if (!verified.ok) {
    return verified.reason === "not_configured"
      ? fail("INTERNAL_ERROR", ACCOUNT_MESSAGES.socialNotConfigured)
      : fail("UNAUTHORIZED", ACCOUNT_MESSAGES.googleFailed);
  }
  if (!verified.identity.emailVerified) return fail("UNAUTHORIZED", ACCOUNT_MESSAGES.googleEmailUnverified);

  return finishSocialSignIn(request, verified.identity, body.value.deviceId, ACCOUNT_MESSAGES.googleFailed);
});
