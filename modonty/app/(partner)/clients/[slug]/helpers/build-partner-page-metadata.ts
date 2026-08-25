import type { Metadata } from "next";
import { mediaSrc, type MediaSrcInput } from "@modonty/shared/lib/media-src";
import { SITE_URL } from "@/constants";
import { generateMetadataFromSEO } from "@/lib/seo";

interface PartnerPageMetadataInput {
  /** The raw `[slug]` param — percent-encoded as it arrives from the router. */
  slug: string;
  /** The sub-page segment: "about" · "articles" · "contact" · "faq" · "photos" · "reviews" · "services". */
  sub: string;
  title: string;
  description: string;
  /** The partner's own identity images — hero wins, logo is the fallback, both may be absent. */
  heroImage?: MediaSrcInput | null;
  logo?: MediaSrcInput | null;
}

/**
 * The seven inner partner pages used to return `{ title, description }` and nothing else, so
 * each one shipped with NO canonical, NO hreflang and NO og:image — measured 25 Aug 2026 on a
 * live partner: `canonical=0 og:image=0 hreflang=0` on all seven. Next.js resolves metadata
 * down the segment chain, and neither `clients/[slug]/layout.tsx` nor `(inner)/layout.tsx`
 * declares any, so nothing filled the gap — `clients/[slug]/page.tsx` is a SIBLING, not a
 * parent, and its canonical never reached them.
 *
 * One builder for all seven, so a page states only what is its own (title · description ·
 * which segment it is) and the identity fields come out identical everywhere. It delegates to
 * `generateMetadataFromSEO`, which is where canonical, hreflang (from Settings, one source)
 * and the OG/Twitter block already live — the same path the rest of the site takes.
 *
 * Google (canonicalization): a self-referencing canonical is how a page nominates itself
 * <https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls>.
 */
export async function buildPartnerPageMetadata({
  slug,
  sub,
  title,
  description,
  heroImage,
  logo,
}: PartnerPageMetadataInput): Promise<Metadata> {
  // Built off `SITE_URL` — the same constant `generateMetadataFromSEO` reads for hreflang, so
  // the canonical host and the hreflang hosts cannot drift apart.
  const canonicalUrl = `${SITE_URL}/clients/${encodeURIComponent(decodeURIComponent(slug))}/${sub}`;

  return generateMetadataFromSEO({
    title,
    description,
    image: mediaSrc(heroImage) || mediaSrc(logo) || undefined,
    url: canonicalUrl,
    type: "website",
  });
}
