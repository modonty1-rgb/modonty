import { NextResponse, type NextRequest } from "next/server";

import { isLiveSection, isLiveSlug, lookupRedirect, publishedFeedTotalPages } from "@/lib/archive-cache";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";

/**
 * Proxy (Next.js 16+ — replaces deprecated middleware) resolves every entity
 * detail URL to one of three outcomes:
 *   live slug            → pass through (HTTP 200 page)
 *   merged/renamed slug  → **308 Permanent Redirect** to the successor slug
 *   gone / never existed → **410 Gone**
 *
 * Sections (see matcher): articles, categories, tags, industries, clients, authors, reels.
 *
 * `authors` joined 2026-08-07: a deleted author's URL was measured returning HTTP 200
 * with an empty noindex page (soft 404) while every other section already returned 410.
 *
 * `reels` joined 2026-08-25 for that same symptom, measured side by side: every other
 * section answered 410 for a slug that does not exist and `/reels/zzz-nope` answered 200.
 * A reel the client removes is exactly the case — its URL was in the sitemap the day
 * before, so leaving it a soft 404 keeps a dead clip in the index.
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
 *
 * `/users/:id` joined 2026-08-14 for the SAME measured symptom the other six were
 * added for: `/users/no-such-user` returned HTTP 200 with the loading skeleton frozen
 * in place, because the shell flushes before `page.tsx` reaches `notFound()`.
 * That route serves two different things behind one segment, so it is resolved by
 * SHAPE before any lookup — see `resolveUserSegment` below.
 */
export const config = {
  matcher: [
    "/articles/:slug",
    "/categories/:slug",
    "/tags/:slug",
    "/industries/:slug",
    "/clients/:slug",
    "/authors/:slug",
    "/reels/:slug",
    "/users/:id",
    "/page/:pageNumber",
  ],
};

const GONE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>410 Gone</title></head><body><h1>410 Gone</h1><p>This page is no longer available.</p></body></html>`;

function gone(): NextResponse {
  return new NextResponse(GONE_HTML, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const NOT_FOUND_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>This page does not exist.</p></body></html>`;

// 404 (not 410) on purpose: an out-of-range feed page never existed, and Google's
// lazy-loading doc prescribes 404 for it — 410 is reserved for content that lived
// and was removed.
function feedPageNotFound(): NextResponse {
  return new NextResponse(NOT_FOUND_HTML, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * `/page/n` — the homepage's paginated series (chunk 1 lives at `/`).
 * Resolved here for the SAME measured symptom as every other section in this file:
 * the shell flushes before `page.tsx` reaches `notFound()`, so in-page validation
 * produced HTTP 200 soft-404s (measured: /page/abc → 200, /page/999 → 200).
 *   not a canonical integer ≥ 2 → 404   ("02", "abc", "0" can never be a chunk)
 *   "1"                         → 308 to `/`  (one URL per chunk, no duplicate)
 *   beyond the last page        → 404   (Google: out-of-range must 404)
 */
async function resolveFeedPage(rawPage: string, request: NextRequest): Promise<NextResponse | undefined> {
  if (rawPage === "1") {
    return NextResponse.redirect(new URL("/", request.url), 308);
  }
  if (!/^[1-9]\d{0,5}$/.test(rawPage)) {
    return feedPageNotFound();
  }
  const page = Number(rawPage);
  const totalPages = await publishedFeedTotalPages(FEED_PAGE_SIZE);
  if (page > totalPages) {
    return feedPageNotFound();
  }
  return undefined; // live chunk → pass through to the page
}

/**
 * Every real page that lives directly under `/users/`. Mirrors the folder listing of
 * `app/users/` minus `[id]` — add a sibling page there and it MUST be added here, or
 * this proxy would 410 it. Kept as one list so that coupling is visible in one place.
 */
const RESERVED_USER_PATHS = new Set([
  "login",
  "register",
  "profile",
  "notifications",
  "forgot-password",
  "reset-password",
  "verify-email",
]);

/** A Mongo ObjectId as it appears in a URL — the shape of a member profile id. */
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

/**
 * `/users/:id` carries two unrelated things, so it is resolved by shape first:
 *
 *   reserved word → a real page under `app/users/` → pass through
 *   ObjectId      → a member profile. Private and `noindex`; whether that member
 *                   exists needs a DB read the page already does, and the id is
 *                   unguessable, so no crawler ever reaches a soft 404 here.
 *   author slug   → 308 to `/authors/<slug>`, the entity's ONE canonical home
 *                   (GEO audit 2026-07-13, ن١٧). `page.tsx` already intends this
 *                   redirect — doing it here makes it a REAL 308 instead of one
 *                   issued after the 200 was committed.
 *   anything else → 410
 */
async function resolveUserSegment(id: string, request: NextRequest): Promise<NextResponse | undefined> {
  if (RESERVED_USER_PATHS.has(id)) return;
  if (OBJECT_ID.test(id)) return;

  if (await isLiveSlug("authors", id)) {
    return NextResponse.redirect(new URL(`/authors/${encodeURIComponent(id)}`, request.url), 308);
  }
  return gone();
}

export async function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  const section = segments[1];
  const rawSlug = segments[2];
  if (!section || !rawSlug) return;

  if (section === "page") {
    return resolveFeedPage(rawSlug, request);
  }

  if (section === "users") {
    let id: string;
    try {
      id = decodeURIComponent(rawSlug);
    } catch {
      return gone();
    }
    return resolveUserSegment(id, request);
  }

  if (!isLiveSection(section)) return;

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
