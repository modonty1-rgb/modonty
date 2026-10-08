import { z } from "zod";

import { getClientReviews } from "@/app/(partner)/clients/[slug]/helpers/client-reviews";
import { getPartnerSite } from "@/app/(partner)/clients/[slug]/helpers/get-partner-site";
import { postClientReviewAs } from "@/lib/clients/post-client-review-as";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";
import { readBody, readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({ limit: z.coerce.number().int().min(1).max(50).default(20) });

/**
 * C13 — GET /api/mobile/v1/partners/:slug/reviews?limit · public.
 * `getClientReviews` — APPROVED star reviews, newest first, with the aggregate (average + count)
 * the partner page shows. Only an ACTIVE partner (`getPartnerSite`).
 */
export const GET = handle("partner-reviews", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  const site = await getPartnerSite(slug);
  if (!site) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return ok(await getClientReviews(site.slug, query.value.limit), PUBLIC_CACHE);
});

// Shape only — the rules and their Arabic texts (1–5 stars, 3–2000 chars) are `ReviewSchema`'s,
// enforced inside postClientReviewAs.
const bodySchema = z.object({
  rating: z.number(),
  comment: z.string().max(5000),
});

/**
 * E12 — POST /api/mobile/v1/partners/:slug/reviews · Bearer.
 * `postClientReviewAs` — the web action's logic: one review per reader per partner (a repeat edits
 * it), saved PENDING until the partner approves, owner cannot review their own page, partner push.
 */
export const POST = handle("partner-review", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await postClientReviewAs(reader.id, slug, body.value);
  if (!result.ok) {
    if (result.reason === "not_found") return fail("NOT_FOUND", MESSAGES.partnerNotFound);
    if (result.reason === "self_review") return fail("FORBIDDEN", result.message);
    return fail("VALIDATION_ERROR", result.message);
  }
  return ok({ status: "PENDING" as const, reviewId: result.reviewId, message: result.message }, undefined, { status: 201 });
});
