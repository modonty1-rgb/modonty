import "server-only";

import { signInOAuthIdentity, type VerifiedOAuthIdentity } from "@/lib/auth/sign-in-oauth-identity";
import { startReaderSession } from "./auth";
import { readDeviceId } from "./device";
import { fail, MESSAGES, ok } from "./http";
import { ACCOUNT_MESSAGES } from "./messages-account";
import { readerProfile } from "./reader-profile";

/**
 * The common tail of A3 (Google) and A4 (Apple): a verified provider identity → the web's
 * find/link/create rule (`signInOAuthIdentity`) → a reader session, answered in A1/A2's shape plus
 * `isNewUser` (201 when the account was just created).
 */
export async function finishSocialSignIn(
  request: Request,
  identity: VerifiedOAuthIdentity,
  bodyDeviceId: string | undefined,
  failedMessage: string,
): Promise<Response> {
  const result = await signInOAuthIdentity(identity);
  if (!result.ok) {
    if (result.reason === "email_missing") return fail("UNAUTHORIZED", ACCOUNT_MESSAGES.appleEmailMissing);
    return fail("UNAUTHORIZED", identity.provider === "google" ? ACCOUNT_MESSAGES.googleEmailUnverified : failedMessage);
  }

  const tokens = await startReaderSession(result.userId, {
    deviceId: bodyDeviceId ?? readDeviceId(request),
    userAgent: request.headers.get("user-agent"),
  });
  const user = await readerProfile(result.userId);
  if (!user) return fail("INTERNAL_ERROR", MESSAGES.internal);
  return ok({ ...tokens, user, isNewUser: result.isNewUser }, undefined, { status: result.isNewUser ? 201 : 200 });
}
