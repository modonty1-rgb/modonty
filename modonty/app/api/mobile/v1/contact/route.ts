import { z } from "zod";

import { acceptContactMessage } from "@/lib/contact/accept-contact-message";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { deviceSessionId, readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";

const objectId = z.string().regex(/^[0-9a-f]{24}$/i);

// Shape and size only — "all fields required" and the email check are `acceptContactMessage`'s,
// with the web's Arabic texts.
const bodySchema = z.object({
  name: z.string().max(200).default(""),
  email: z.string().max(320).default(""),
  subject: z.string().max(300).default(""),
  message: z.string().max(5000).default(""),
  clientId: objectId.optional(),
});

/**
 * E20 — POST /api/mobile/v1/contact · public + X-Device-Id (required) · Bearer optional.
 * `acceptContactMessage` — the web `/contact/api` logic: required fields, 3 per IP per hour (DB),
 * ContactMessage row (linked to the reader when signed in), CONTACT_FORM conversion keyed on the
 * device, partner Telegram when addressed to a partner, GA4.
 */
export const POST = handle("contact", async (request: Request) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const reader = await readerFromRequest(request);
  const result = await acceptContactMessage({
    body: body.value,
    headers: request.headers,
    userId: reader?.id ?? null,
    resolveSessionId: async () => deviceSessionId(deviceId),
  });

  if (result.kind === "invalid") return fail("VALIDATION_ERROR", result.error);
  if (result.kind === "rate_limited") return fail("RATE_LIMITED", result.error);
  if (result.kind === "failed") {
    return result.error === "العميل غير موجود"
      ? fail("NOT_FOUND", MESSAGES.partnerNotFound)
      : fail("INTERNAL_ERROR", result.error);
  }
  return ok({ sent: true, message: result.message }, undefined, { status: 201 });
});
