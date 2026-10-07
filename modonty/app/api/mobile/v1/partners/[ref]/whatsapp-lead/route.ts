import { z } from "zod";

import { db } from "@/lib/db";
import { recordWhatsappLeadFor } from "@/lib/booking/record-whatsapp-lead-for";
import { deviceSessionId, readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

const objectId = z.string().regex(/^[0-9a-f]{24}$/i);

const bodySchema = z
  .object({
    source: z.enum(["article_dock", "article_card", "client_page", "client_list"]).default("client_page"),
    articleId: objectId.nullish(),
    /**
     * The app's own visit id (e.g. its analytics session), so a genuine return visit counts as a
     * fresh lead like on the web. Absent → one lead per device per partner per UTC day.
     */
    sessionId: z.string().regex(/^[A-Za-z0-9._:-]{1,64}$/).optional(),
  })
  .default({});

/**
 * E15 — POST /api/mobile/v1/partners/:id/whatsapp-lead · public + X-Device-Id (required).
 * `recordWhatsappLeadFor` — the web's WhatsApp-tap logic (GA4 on every tap · one BookingRequest
 * per visitor × partner × session · partner push on a stored lead · article credit from this
 * device's recent read), with the device standing in for the web's cookies.
 *
 * The web action trusts the clientId its own page rendered; here the id comes from the caller, so
 * the partner must exist before a lead row is written for it.
 */
export const POST = handle("partner-whatsapp-lead", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const { ref: clientId } = await params;
  const malformed = rejectMalformedIds([clientId], MESSAGES.partnerNotFound);
  if (malformed) return malformed;

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const client = await db.client.findUnique({ where: { id: clientId }, select: { id: true } });
  if (!client) return fail("NOT_FOUND", MESSAGES.partnerNotFound);

  const device = deviceSessionId(deviceId);
  const sessionId = body.value.sessionId
    ? `${device}:${body.value.sessionId}`
    : `${device}:${new Date().toISOString().slice(0, 10)}`;

  const result = await recordWhatsappLeadFor(
    { clientId, source: body.value.source, articleId: body.value.articleId ?? null },
    { visitorId: device, sessionId, viewSessionId: device, headers: request.headers },
  );
  if (result === "failed") return fail("INTERNAL_ERROR", MESSAGES.internal);
  return ok({ recorded: result === "recorded" });
});
