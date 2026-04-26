import { NextResponse, type NextRequest } from "next/server";

import { isPublishedSlug } from "@/lib/archive-cache";

/**
 * Proxy (Next.js 16+ — replaces deprecated middleware) returns
 * **410 Gone** for any /articles/[slug] that is NOT a currently-published article:
 * archived, draft, scheduled, or deleted from DB entirely.
 *
 * Per Google Search Central: 410 is the clearest signal for permanently removed
 * content and accelerates de-indexing more reliably than 404 or `noindex`.
 *
 * Runs only for /articles/[slug] paths (see matcher below).
 */
export const config = {
  matcher: "/articles/:slug",
};

const GONE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>410 Gone</title></head><body><h1>410 Gone</h1><p>This article is no longer available.</p></body></html>`;

export async function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  const rawSlug = segments[2];
  if (!rawSlug) return;

  const slug = decodeURIComponent(rawSlug);
  const isPublic = await isPublishedSlug(slug);
  if (isPublic) return; // pass through to the article page

  return new NextResponse(GONE_HTML, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
