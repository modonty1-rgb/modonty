import "server-only";

import { getCachedHomeData } from "@/app/(partner)/clients/[slug]/helpers/get-cached-home-data";
import { getPartnerSite } from "@/app/(partner)/clients/[slug]/helpers/get-partner-site";
import { fail, MESSAGES } from "./http";
import { decodeSlug } from "./params";
import type { Parsed } from "./request";

type PartnerHome = {
  slug: string;
  site: NonNullable<Awaited<ReturnType<typeof getPartnerSite>>>;
  home: NonNullable<Awaited<ReturnType<typeof getCachedHomeData>>>["data"];
};

/**
 * The pair every partner sub-page reads before drawing a block (`PageBlocks`,
 * `app/(partner)/clients/[slug]/components/page-blocks.tsx`): `getPartnerSite` — only an ACTIVE
 * partner exists — and `getCachedHomeData`, the block data the articles/reviews/photos/faq/reels
 * pages render. A missing or inactive partner is a ready 404 (`Parsed`, like `readQuery`).
 */
export async function loadPartnerHome(rawRef: string): Promise<Parsed<PartnerHome>> {
  const slug = decodeSlug(rawRef);
  if (!slug) return { response: fail("NOT_FOUND", MESSAGES.partnerNotFound) };
  const [site, home] = await Promise.all([getPartnerSite(slug), getCachedHomeData(slug)]);
  if (!site || !home) return { response: fail("NOT_FOUND", MESSAGES.partnerNotFound) };
  return { value: { slug, site, home: home.data } };
}
