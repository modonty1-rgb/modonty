import { NextResponse, type NextRequest } from "next/server";

import { isLiveSection, isLiveSlug, lookupRedirect } from "@/lib/archive-cache";

/**
 * Proxy (Next.js 16+ — replaces deprecated middleware) resolves every entity
 * detail URL to one of three outcomes:
 *   live slug            → pass through (HTTP 200 page)
 *   merged/renamed slug  → **308 Permanent Redirect** to the successor slug
 *   gone / never existed → **410 Gone**
 *
 * Sections (see matcher): articles, categories, tags, industries, clients.
 *
 * Per Google Search Central: 4xx tells the indexing pipeline the content doesn't
 * exist → the URL is removed from the index; 308 (treated as ≡ 301) moves the URL
 * to its successor and passes link equity. Without this proxy these routes stream
 * (loading.tsx) and commit HTTP 200 before notFound() runs — a soft 404.
 *
 * Ordering is safety-critical: check live FIRST so a redirect can never fire on a
 * slug that is actually serving a page.
 *
 * 308 (not 301) is verified best practice: RFC 7538 + MDN (preserves method vs
 * 301's legacy POST→GET break), Google Search Central (301 ≡ 308 for signals),
 * and Next.js docs (`NextResponse.redirect(url, 308)`).
 */
export const config = {
  matcher: [
    "/articles/:slug",
    "/categories/:slug",
    "/tags/:slug",
    "/industries/:slug",
    "/clients/:slug",
  ],
};

const GONE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>410 Gone</title></head><body><h1>410 Gone</h1><p>This page is no longer available.</p></body></html>`;

function gone(): NextResponse {
  return new NextResponse(GONE_HTML, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  const section = segments[1];
  const rawSlug = segments[2];
  if (!section || !rawSlug || !isLiveSection(section)) return;

  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    return gone(); // malformed percent-encoding can never be a live slug
  }

  const isLive = await isLiveSlug(section, slug);
  if (isLive) return; // pass through to the page

  // Not live → a merge/rename may have left a permanent redirect for this slug.
  const toSlug = await lookupRedirect(section, slug);
  if (toSlug) {
    return NextResponse.redirect(new URL(`/${section}/${toSlug}`, request.url), 308);
  }

  return gone();
}
