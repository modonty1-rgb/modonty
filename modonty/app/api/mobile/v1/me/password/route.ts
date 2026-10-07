import { z } from "zod";

import { db } from "@/lib/db";
import { createPasswordSchema } from "@/app/(site)/users/profile/settings/helpers/schemas/settings-schemas";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import {
  clearLoginFailures,
  clientIp,
  loginBlockedForSeconds,
  loginThrottleKey,
  recordLoginFailure,
} from "@/lib/mobile-api/login-throttle";
import { readBody } from "@/lib/mobile-api/request";
import { changePasswordAs } from "@/lib/users/change-password-as";
import { createPasswordAs } from "@/lib/users/create-password-as";

/** «لم تُلغَ» — null OR unset (Mongo: `revokedAt: null` alone misses an absent field). */
const NOT_REVOKED = { OR: [{ revokedAt: null }, { revokedAt: { isSet: false } }] };

const WRONG_CURRENT = "كلمة المرور الحالية غير صحيحة";

// Shape only — the rules and Arabic texts are `passwordSchema` / `createPasswordSchema`'s.
const bodySchema = z.object({
  currentPassword: z.string().max(256).optional(),
  newPassword: z.string().max(256),
  confirmPassword: z.string().max(256),
});

/**
 * A11 — POST /api/mobile/v1/me/password · Bearer · `{ currentPassword?, newPassword, confirmPassword }`.
 * One door for the web's two actions: an account WITH a password → `changePasswordAs` (current one
 * required, bcrypt-checked); an account without (Google/Apple-first) → `createPasswordAs`, after the
 * same `createPasswordSchema` strength rule the web form applies. A wrong current password counts
 * against the login limit (5 / 15 min per email + IP → 429), like `DELETE /me`.
 * On success every OTHER app session of this reader is revoked (`PasswordChanged`); this one stays.
 * → `{ ok: true, created: boolean, revokedSessions: number }`
 */
export const POST = handle("me-password", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const user = await db.user.findUnique({ where: { id: reader.id }, select: { email: true, password: true } });
  if (!user) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  let result: { success: boolean; error?: string };
  if (user.password) {
    const key = loginThrottleKey(user.email ?? reader.id, clientIp(request));
    const blockedFor = await loginBlockedForSeconds(key);
    if (blockedFor !== null) {
      return fail("RATE_LIMITED", MESSAGES.tooManyAttempts, { retryAfterSeconds: blockedFor }, { "Retry-After": String(blockedFor) });
    }
    result = await changePasswordAs(reader.id, body.value);
    if (result.error === WRONG_CURRENT) {
      await recordLoginFailure(key);
      return fail("FORBIDDEN", WRONG_CURRENT);
    }
    if (result.success) await clearLoginFailures(key);
  } else {
    const strength = createPasswordSchema.safeParse({
      password: body.value.newPassword,
      confirmPassword: body.value.confirmPassword,
    });
    if (!strength.success) {
      return fail("VALIDATION_ERROR", strength.error.issues[0]?.message ?? MESSAGES.invalidBody);
    }
    result = await createPasswordAs(reader.id, strength.data);
  }

  if (!result.success) {
    return result.error?.startsWith("Failed to")
      ? fail("INTERNAL_ERROR", MESSAGES.internal)
      : fail("VALIDATION_ERROR", result.error ?? MESSAGES.invalidBody);
  }

  const revoked = await db.readerSession.updateMany({
    where: { userId: reader.id, id: { not: reader.sessionId }, ...NOT_REVOKED },
    data: { revokedAt: new Date(), revokedReason: "PasswordChanged" },
  });
  return ok({ ok: true, created: !user.password, revokedSessions: revoked.count });
});
