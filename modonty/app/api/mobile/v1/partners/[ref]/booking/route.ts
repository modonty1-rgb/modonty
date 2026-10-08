import { z } from "zod";

import { submitBookingRequest } from "@/components/shared/booking-form/booking-actions";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

// Field rules (phone E.164, future date, lengths) are `bookingSchema`'s, enforced inside the action.
const bodySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string(),
  preferredAt: z.string().nullish(),
  message: z.string().optional(),
  source: z.enum(["article_dock", "article_card", "client_page", "client_list"]).default("client_page"),
  articleId: z.string().regex(/^[0-9a-f]{24}$/i).nullish(),
  disclaimerAccepted: z.boolean().default(false),
  newsletterOptIn: z.boolean().optional(),
});

/**
 * E14 — POST /api/mobile/v1/partners/:id/booking · public.
 * `submitBookingRequest` — the same action the article form and `/api/booking` use: one
 * validation, one write, one set of alerts (partner push · admin notification · email ·
 * Telegram · GA4 · conversion). A refusal (bad phone, repeat within the hour, missing
 * acknowledgement) comes back as VALIDATION_ERROR with the web's own Arabic text.
 *
 * Anonymous by design here: the action reads the reader from the web session cookie itself and
 * is a public Server Action — it must not accept a caller-supplied user id.
 */
export const POST = handle("partner-booking", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const { ref: clientId } = await params;
  const malformed = rejectMalformedIds([clientId], MESSAGES.partnerNotFound);
  if (malformed) return malformed;

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;
  const b = body.value;

  const result = await submitBookingRequest(
    { name: b.name, email: b.email, phone: b.phone, preferredAt: b.preferredAt, message: b.message },
    {
      clientId,
      articleId: b.articleId ?? null,
      source: b.source,
      disclaimerAccepted: b.disclaimerAccepted,
      marketingConsent: b.newsletterOptIn,
    },
  );

  if (result.success) return ok({ success: true }, undefined, { status: 201 });
  if (result.error === "الشركة غير موجودة") return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return fail("VALIDATION_ERROR", result.error ?? MESSAGES.invalidBody);
});
