import { z } from "zod";

import { forgotPasswordAction } from "@/app/(site)/users/forgot-password/actions/forgot-password-action";
import { fail, handle, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";

// The action validates the email itself; this only shapes the JSON into its FormData.
const bodySchema = z.object({ email: z.string().max(320) });

/**
 * A7 — POST /api/mobile/v1/auth/forgot-password · public.
 * `forgotPasswordAction` — the web's flow: hashed token, one-hour expiry, Resend email whose link
 * opens the web reset page. Always `{ sent: true }` for a well-formed email (no enumeration).
 */
export const POST = handle("auth-forgot-password", async (request: Request) => {
  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const form = new FormData();
  form.set("email", body.value.email);
  const result = await forgotPasswordAction(form);

  if (!result.success) {
    // Either the web's «بريد إلكتروني غير صحيح» (bad email) or its generic retry message.
    return result.error === "بريد إلكتروني غير صحيح"
      ? fail("VALIDATION_ERROR", result.error)
      : fail("INTERNAL_ERROR", result.error);
  }
  return ok({ sent: true });
});
