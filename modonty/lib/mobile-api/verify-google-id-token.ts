import "server-only";

import { OAuth2Client } from "google-auth-library";

import type { VerifiedOAuthIdentity } from "@/lib/auth/sign-in-oauth-identity";

/**
 * Accepted `aud` values — the web client (`GOOGLE_CLIENT_ID`, already used by the web provider in
 * `auth.config.ts`; `@react-native-google-signin` issues ID tokens for the `webClientId`) plus the
 * native iOS / Android client IDs when set. Names only; no fallback values.
 */
function googleAudiences(): string[] {
  return [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_IOS_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID].filter(
    (v): v is string => !!v,
  );
}

// One client per instance: it caches Google's signing certs between requests.
const client = new OAuth2Client();

export type GoogleVerifyResult = { ok: true; identity: VerifiedOAuthIdentity } | { ok: false; reason: "not_configured" | "invalid" };

/**
 * google-auth-library `OAuth2Client.verifyIdToken({ idToken, audience })` (d.ts:
 * `VerifyIdTokenOptions { idToken; audience?: string | string[]; maxExpiry? }` → `LoginTicket.getPayload()`)
 * checks the signature against Google's certs, `exp`, `aud` ∈ audience and `iss` ∈ accounts.google.com.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleVerifyResult> {
  const audience = googleAudiences();
  if (audience.length === 0) {
    console.error("[mobile-api:auth-google] GOOGLE_CLIENT_ID is not set");
    return { ok: false, reason: "not_configured" };
  }
  let payload;
  try {
    payload = (await client.verifyIdToken({ idToken, audience })).getPayload();
  } catch (error) {
    // A forged/expired/foreign token is a client error, not an outage — logged, answered 401.
    console.warn("[mobile-api:auth-google] verifyIdToken rejected", error instanceof Error ? error.message : error);
    return { ok: false, reason: "invalid" };
  }
  if (!payload?.sub) return { ok: false, reason: "invalid" };
  return {
    ok: true,
    identity: {
      provider: "google",
      providerAccountId: payload.sub,
      email: payload.email ?? null,
      emailVerified: payload.email_verified === true,
      name: payload.name ?? null,
      image: payload.picture ?? null,
    },
  };
}
