import { z } from "zod";

import { getClientFollowers } from "@/app/(partner)/clients/[slug]/helpers/client-followers";
import { getPartnerSite } from "@/app/(partner)/clients/[slug]/helpers/get-partner-site";
import { fail, handle, MESSAGES, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";
import { readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  // The web page reads 6 (`(inner)/(plain)/followers/page.tsx`); the app may ask for more.
  limit: z.coerce.number().int().min(1).max(60).default(6),
});

/**
 * C13 — GET /api/mobile/v1/partners/:slug/followers?limit · public.
 * `getClientFollowers` — the newest followers (ClientLike rows) with name and avatar, as
 * `/clients/[slug]/followers` lists them. Only an ACTIVE partner (`getPartnerSite`).
 */
export const GET = handle("partner-followers", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  const site = await getPartnerSite(slug);
  if (!site) return fail("NOT_FOUND", MESSAGES.partnerNotFound);

  const followers = await getClientFollowers(site.slug, query.value.limit);
  if (!followers) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return ok({ items: followers }, PUBLIC_CACHE);
});
