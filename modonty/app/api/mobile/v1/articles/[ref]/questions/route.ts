import { z } from "zod";

import { submitAskClientAs } from "@/lib/articles/submit-ask-client-as";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

// Shape only — rules and Arabic texts are `askClientSchema`'s (inside the As function).
// name/email are optional here: the account's own name and email win, exactly as on the web.
const bodySchema = z.object({
  question: z.string().max(5000),
  name: z.string().max(200).optional(),
  email: z.string().max(320).optional(),
});

/**
 * E13 — POST /api/mobile/v1/articles/:id/questions · Bearer.
 * `submitAskClientAs` — the web «اسأل العميل» logic: ArticleFAQ PENDING (source "user"), max 5
 * unanswered per reader per article, partner push + Telegram + GA4.
 */
export const POST = handle("article-question", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const { ref: id } = await params;
  const malformed = rejectMalformedIds([id], MESSAGES.articleNotFound);
  if (malformed) return malformed;

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await submitAskClientAs(
    reader,
    {
      question: body.value.question,
      name: body.value.name ?? reader.name ?? "",
      email: body.value.email ?? reader.email ?? "",
    },
    id,
  );
  if (!result.success) {
    if (result.reason === "not_found") return fail("NOT_FOUND", MESSAGES.articleNotFound);
    if (result.reason === "too_many_pending") return fail("CONFLICT", result.error);
    return fail("VALIDATION_ERROR", result.error);
  }
  return ok({ ok: true }, undefined, { status: 201 });
});
