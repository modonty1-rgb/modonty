import { z } from "zod";

import { submitClientPageQuestionAs } from "@/lib/clients/submit-client-page-question-as";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

// Shape only — rules and Arabic texts are `clientQuestionSchema`'s (inside the As function).
// name/email are optional here: the account's own name and email win, exactly as on the web.
const bodySchema = z.object({
  question: z.string().max(5000),
  name: z.string().max(200).optional(),
  email: z.string().max(320).optional(),
});

/**
 * E13 — POST /api/mobile/v1/partners/:slug/questions · Bearer.
 * `submitClientPageQuestionAs` — the web action's logic: ClientFAQ PENDING (source "user"), max 5
 * unanswered per reader per partner, partner push + Telegram.
 */
export const POST = handle("partner-question", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await submitClientPageQuestionAs(
    reader,
    {
      question: body.value.question,
      name: body.value.name ?? reader.name ?? "",
      email: body.value.email ?? reader.email ?? "",
    },
    slug,
  );
  if (!result.success) {
    if (result.reason === "not_found") return fail("NOT_FOUND", MESSAGES.partnerNotFound);
    if (result.reason === "too_many_pending") return fail("CONFLICT", result.error);
    return fail("VALIDATION_ERROR", result.error);
  }
  return ok({ ok: true }, undefined, { status: 201 });
});
