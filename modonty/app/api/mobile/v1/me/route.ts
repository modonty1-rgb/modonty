import bcrypt from "bcryptjs";
import { z } from "zod";

import { getProfileStats } from "@/app/(site)/users/profile/helpers/profile-stats";
import { db } from "@/lib/db";
import { countUnreadNotifications } from "@/lib/notifications/count-unread-notifications";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import {
  clearLoginFailures,
  clientIp,
  loginBlockedForSeconds,
  loginThrottleKey,
  recordLoginFailure,
} from "@/lib/mobile-api/login-throttle";
import { ACCOUNT_MESSAGES } from "@/lib/mobile-api/messages-account";
import { readerProfile } from "@/lib/mobile-api/reader-profile";
import { readBody } from "@/lib/mobile-api/request";
import { deleteAccountAs } from "@/lib/users/delete-account-as";
import { updateProfileAs } from "@/lib/users/update-profile-as";

/**
 * A8 — GET /api/mobile/v1/me · Bearer.
 * The reader (session fields, fresh), their profile stats (`getProfileStats`, the profile page's
 * read) and the bell count (`countUnreadNotifications`, the web badge's count).
 */
export const GET = handle("me", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const [user, stats, unreadNotifications] = await Promise.all([
    readerProfile(reader.id),
    getProfileStats(reader.id),
    countUnreadNotifications(reader.id),
  ]);
  if (!user) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  return ok({ user, stats, unreadNotifications });
});

const deleteSchema = z.object({
  /** Required when the account has a password; a Google/Apple-only account proves itself by the Bearer token. */
  password: z.string().min(1).max(256).optional(),
  /** The web dialog's own confirmation word (`account-settings.tsx`). */
  confirm: z.string(),
});

/**
 * A14 — DELETE /api/mobile/v1/me · Bearer · `{ password?, confirm: "حذف" }` (App Store 5.1.1(v)).
 * Same deletion as the web settings action (`deleteAccountAs` — what is deleted/detached is listed
 * there). Stricter door than the web: an account with a password must re-enter it, behind the login
 * limit (5 wrong / 15 min per email + IP → 429). All app sessions are revoked first.
 * → `{ deleted: true }`
 */
export const DELETE = handle("me-delete", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const body = await readBody(request, deleteSchema);
  if ("response" in body) return body.response;
  if (body.value.confirm.trim() !== "حذف") return fail("VALIDATION_ERROR", ACCOUNT_MESSAGES.deleteConfirm);

  const user = await db.user.findUnique({ where: { id: reader.id }, select: { email: true, password: true } });
  if (!user) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  if (user.password) {
    if (!body.value.password) return fail("VALIDATION_ERROR", ACCOUNT_MESSAGES.passwordRequired);
    const key = loginThrottleKey(user.email ?? reader.id, clientIp(request));
    const blockedFor = await loginBlockedForSeconds(key);
    if (blockedFor !== null) {
      return fail("RATE_LIMITED", MESSAGES.tooManyAttempts, { retryAfterSeconds: blockedFor }, { "Retry-After": String(blockedFor) });
    }
    if (!(await bcrypt.compare(body.value.password, user.password))) {
      await recordLoginFailure(key);
      return fail("FORBIDDEN", ACCOUNT_MESSAGES.passwordWrong);
    }
    await clearLoginFailures(key);
  }

  await deleteAccountAs(reader.id);
  return ok({ deleted: true });
});

// Shape only — the rules and their Arabic texts (name 2–100 · bio ≤500 · avatar must be a hosted
// http(s) URL, never `data:`) are `profileSchema`'s, enforced inside updateProfileAs.
const profilePatchSchema = z.object({
  name: z.string().max(500),
  bio: z.string().max(5000).optional(),
  image: z.string().max(2048).nullable().optional(),
});

/**
 * A9 — PATCH /api/mobile/v1/me · Bearer · `{ name, bio?, image? }` (the web form sends all three;
 * an omitted bio/image is cleared, exactly as there). `updateProfileAs` — the settings action's
 * logic: server-side `profileSchema`, revalidates `/users/profile` + `/users/profile/settings`.
 * A new avatar is uploaded first with `POST /me/avatar`, whose `url` goes in `image`.
 * → `{ user }` (same shape as A8)
 */
export const PATCH = handle("me-update", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const body = await readBody(request, profilePatchSchema);
  if ("response" in body) return body.response;

  const result = await updateProfileAs(reader.id, body.value);
  if (!result.success) {
    return result.error === "Failed to update profile"
      ? fail("INTERNAL_ERROR", MESSAGES.internal)
      : fail("VALIDATION_ERROR", result.error ?? MESSAGES.invalidBody);
  }
  const user = await readerProfile(reader.id);
  if (!user) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  return ok({ user });
});
