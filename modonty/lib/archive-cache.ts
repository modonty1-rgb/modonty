import { db } from "@/lib/db";

/**
 * In-memory cache of PUBLISHED article slugs for fast proxy lookup.
 *
 * IMPORTANT: deliberately NOT using `unstable_cache` from `next/cache`.
 * Reason: Next.js 16 cache layer auto-writes `x-next-cache-tags` HTTP header on
 * every cache hit/miss, which throws `TypeError: Invalid character in header content`
 * (ERR_INVALID_CHAR) for any request whose route path contains non-ASCII chars.
 * Our /articles/[slug] route receives Arabic slugs → 100% 500 from origin.
 *
 * This simple module-scoped cache lives entirely in the serverless function's
 * memory, refreshes every 5 minutes, and does NOT touch Next.js's cache
 * infrastructure — so no auto-tag header is written, no header validation runs.
 *
 * Fail-open semantics preserved: on DB error, return true so we never accidentally
 * 410 a live page during a transient DB hiccup.
 *
 * Tracked Next.js limitations:
 *   - https://github.com/vercel/next.js/discussions/26758 (Arabic chars in [slug])
 *   - https://github.com/vercel/next.js/issues/73965 (Non-ASCII routes break)
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedSlugs: Set<string> | null = null;
let cachedAt = 0;
let inFlight: Promise<Set<string>> | null = null;

async function loadPublishedSlugs(): Promise<Set<string>> {
  const published = await db.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return new Set(published.map((a) => a.slug));
}

/** True when the slug is a currently-published article (the only state that should serve a 200). */
export async function isPublishedSlug(slug: string): Promise<boolean> {
  const now = Date.now();
  const stale = !cachedSlugs || now - cachedAt > CACHE_TTL_MS;

  if (stale) {
    // Dedupe concurrent refreshes — only one DB query per refresh window.
    if (!inFlight) {
      inFlight = loadPublishedSlugs()
        .then((set) => {
          cachedSlugs = set;
          cachedAt = Date.now();
          return set;
        })
        .finally(() => {
          inFlight = null;
        });
    }
    try {
      const set = await inFlight;
      return set.has(slug);
    } catch {
      // On DB failure, default to "published" so we don't accidentally 410 a live page.
      return true;
    }
  }

  return cachedSlugs!.has(slug);
}

/** Force-clear the in-memory cache. Call after publish/unpublish mutations if needed. */
export function clearPublishedSlugsCache(): void {
  cachedSlugs = null;
  cachedAt = 0;
  inFlight = null;
}
