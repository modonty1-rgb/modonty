import { NextResponse, type NextRequest } from "next/server";

import { isArchivedSlug } from "@/lib/archive-cache";

/**
 * Proxy (Next.js 16+ — replaces deprecated middleware) returns
 * **410 Gone** for archived article URLs. Per Google Search Central best
 * practice, 410 is the clearest signal for permanently removed content
 * and accelerates de-indexing more reliably than 404.
 *
 * Runs only for /articles/[slug] paths (see matcher below).
 */
export const config = {
  matcher: "/articles/:slug",
};

export async function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  const rawSlug = segments[2];
  if (!rawSlug) return;

  const slug = decodeURIComponent(rawSlug);
  if (await isArchivedSlug(slug)) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>410 Gone</title></head><body><h1>410 Gone</h1><p>This article has been permanently archived.</p></body></html>`,
      {
        status: 410,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }
}
