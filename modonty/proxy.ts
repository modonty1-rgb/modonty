import { NextResponse, type NextRequest } from "next/server";

import { isLiveSection, isLiveSlug } from "@/lib/archive-cache";

/**
 * Proxy (Next.js 16+ — replaces deprecated middleware) returns
 * **410 Gone** for any entity detail URL that is NOT currently publicly served:
 *   /articles/[slug]    → not a PUBLISHED article (archived, draft, scheduled, deleted)
 *   /categories/[slug]  → category deleted / never existed
 *   /tags/[slug]        → tag deleted / never existed
 *   /industries/[slug]  → industry deleted / never existed
 *   /clients/[slug]     → client deleted or subscription not ACTIVE
 *
 * Per Google Search Central: any 4xx tells the indexing pipeline the content
 * doesn't exist → the URL is removed from the index. Without this proxy these
 * routes stream (loading.tsx) and commit HTTP 200 before notFound() runs —
 * a soft 404 that leaves dead URLs lingering and wastes crawl budget.
 *
 * Runs only for the single-segment entity paths above (see matcher below).
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

  return gone();
}
