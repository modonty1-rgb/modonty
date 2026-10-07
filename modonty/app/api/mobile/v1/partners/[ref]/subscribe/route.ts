import { z } from "zod";

import { db } from "@/lib/db";
import { readDeviceId, deviceSessionId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACTION_MESSAGES } from "@/lib/mobile-api/messages-actions";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";
import { subscribeToClientNewsletter } from "@/lib/newsletter/subscribe-to-client-newsletter";

// Shape only — the address rule (`email().max(254)`) is the shared function's.
const bodySchema = z.object({ email: z.string().max(320) });

/**
 * E19 — POST /api/mobile/v1/partners/:id/subscribe · public + X-Device-Id (required) · `{ email }`.
 * `subscribeToClientNewsletter` — the web partner-newsletter logic: 5 per email per hour (DB),
 * one row per email × partner, admin + partner Telegram, partner push, NEWSLETTER conversion
 * keyed on the device, GA4. The partner must exist (the web trusts the id its page rendered).
 */
export const POST = handle("partner-subscribe", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const { ref: clientId } = await params;
  const malformed = rejectMalformedIds([clientId], MESSAGES.partnerNotFound);
  if (malformed) return malformed;

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const client = await db.client.findUnique({ where: { id: clientId }, select: { id: true } });
  if (!client) return fail("NOT_FOUND", MESSAGES.partnerNotFound);

  const result = await subscribeToClientNewsletter({
    body: { email: body.value.email.trim(), clientId },
    headers: request.headers,
    resolveSessionId: async () => deviceSessionId(deviceId),
  });

  if (result === "invalid") return fail("VALIDATION_ERROR", ACTION_MESSAGES.invalidEmail);
  if (result === "rate_limited") return fail("RATE_LIMITED", ACTION_MESSAGES.partnerSubscribeRateLimited);
  return ok({ subscribed: true, alreadySubscribed: result === "exists" });
});
