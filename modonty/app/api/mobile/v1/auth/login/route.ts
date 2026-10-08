import { z } from "zod";

import { verifyCredentials } from "@/lib/auth/verify-credentials";
import { startReaderSession } from "@/lib/mobile-api/auth";
import { readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import {
  clearLoginFailures,
  clientIp,
  loginBlockedForSeconds,
  loginThrottleKey,
  recordLoginFailure,
} from "@/lib/mobile-api/login-throttle";
import { readBody } from "@/lib/mobile-api/request";
import { readerProfile } from "@/lib/mobile-api/reader-profile";

const bodySchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(256),
});

/**
 * A2 — POST /api/mobile/v1/auth/login · public.
 * The web's own credential check (`verifyCredentials`, shared with the Credentials provider),
 * behind a DB-backed limit: 5 failures / 15 min per (email + IP) → 429 + Retry-After.
 */
export const POST = handle("auth-login", async (request: Request) => {
  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;
  const { email, password } = body.value;

  const key = loginThrottleKey(email, clientIp(request));
  const blockedFor = await loginBlockedForSeconds(key);
  if (blockedFor !== null) {
    return fail("RATE_LIMITED", MESSAGES.tooManyAttempts, { retryAfterSeconds: blockedFor }, { "Retry-After": String(blockedFor) });
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    await recordLoginFailure(key);
    return fail("UNAUTHORIZED", MESSAGES.badCredentials);
  }

  await clearLoginFailures(key);
  const tokens = await startReaderSession(user.id, {
    deviceId: readDeviceId(request),
    userAgent: request.headers.get("user-agent"),
  });
  return ok({ ...tokens, user: await readerProfile(user.id) });
});
