import { registerUser } from "@/app/(site)/users/register/actions/register-actions";
import { registerSchema } from "@/app/(site)/users/register/helpers/schemas/register-schema";
import { db } from "@/lib/db";
import { startReaderSession } from "@/lib/mobile-api/auth";
import { readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readerProfile } from "@/lib/mobile-api/reader-profile";

const EMAIL_TAKEN = "البريد الإلكتروني مستخدم بالفعل";

/**
 * A1 — POST /api/mobile/v1/auth/register · public.
 * `registerUser` — the web's sign-up, untouched: the same schema, bcrypt, welcome + verification
 * emails, Telegram, SIGNUP conversion, GA4 `signup_complete`. Then a reader session is opened,
 * so the app is signed in right away (the web sends the reader to the login form instead).
 */
export const POST = handle("auth-register", async (request: Request) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return fail("VALIDATION_ERROR", MESSAGES.invalidBody);
  }

  const result = await registerUser(raw);
  if (!result.success) {
    if (result.error === EMAIL_TAKEN) return fail("CONFLICT", EMAIL_TAKEN);
    if ("fieldErrors" in result) return fail("VALIDATION_ERROR", result.error, { fieldErrors: result.fieldErrors });
    return fail("INTERNAL_ERROR", result.error);
  }

  // registerUser succeeded, so the same schema parses; its email is the one it stored.
  const { email } = registerSchema.parse(raw);
  const created = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!created) return fail("INTERNAL_ERROR", MESSAGES.internal);

  const tokens = await startReaderSession(created.id, {
    deviceId: readDeviceId(request),
    userAgent: request.headers.get("user-agent"),
  });
  return ok({ ...tokens, user: await readerProfile(created.id) }, undefined, { status: 201 });
});
