import { db } from "@/lib/db";

/**
 * In-memory caches of live public slugs for fast proxy lookup
 * (articles, categories, tags, industries, clients).
 *
 * IMPORTANT: deliberately NOT using `unstable_cache` from `next/cache`.
 * Reason: Next.js 16 cache layer auto-writes `x-next-cache-tags` HTTP header on
 * every cache hit/miss, which throws `TypeError: Invalid character in header content`
 * (ERR_INVALID_CHAR) for any request whose route path contains non-ASCII chars.
 * Our [slug] routes receive Arabic slugs → 100% 500 from origin.
 *
 * These simple module-scoped caches live entirely in the serverless function's
 * memory, refresh every 5 minutes, and do NOT touch Next.js's cache
 * infrastructure — so no auto-tag header is written, no header validation runs.
 *
 * Fail-open semantics preserved: on DB error, return true so we never accidentally
 * 410 a live page during a transient DB hiccup.
 *
 * Each check mirrors the visibility rule of its page:
 *   - articles   → status PUBLISHED (only state that serves a 200)
 *   - clients    → subscriptionStatus ACTIVE (client page 404s otherwise)
 *   - categories/tags/industries/authors → any existing row renders
 *     (author page notFound()s only when the row is missing — app/authors/[slug]/page.tsx:154)
 *
 * Tracked Next.js limitations:
 *   - https://github.com/vercel/next.js/discussions/26758 (Arabic chars in [slug])
 *   - https://github.com/vercel/next.js/issues/73965 (Non-ASCII routes break)
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface SlugCache {
  has: (slug: string) => Promise<boolean>;
  clear: () => void;
}

function createSlugCache(load: () => Promise<Set<string>>): SlugCache {
  let cached: Set<string> | null = null;
  let cachedAt = 0;
  let inFlight: Promise<Set<string>> | null = null;

  return {
    async has(slug: string): Promise<boolean> {
      const now = Date.now();
      const stale = !cached || now - cachedAt > CACHE_TTL_MS;

      if (stale) {
        // Dedupe concurrent refreshes — only one DB query per refresh window.
        if (!inFlight) {
          inFlight = load()
            .then((set) => {
              cached = set;
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
          // On DB failure, default to "live" so we don't accidentally 410 a live page.
          return true;
        }
      }

      return cached!.has(slug);
    },
    clear() {
      cached = null;
      cachedAt = 0;
      inFlight = null;
    },
  };
}

const toSlugSet = (rows: Array<{ slug: string }>) => new Set(rows.map((r) => r.slug));

const caches = {
  articles: createSlugCache(async () =>
    toSlugSet(await db.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } })),
  ),
  categories: createSlugCache(async () => toSlugSet(await db.category.findMany({ select: { slug: true } }))),
  tags: createSlugCache(async () => toSlugSet(await db.tag.findMany({ select: { slug: true } }))),
  industries: createSlugCache(async () => toSlugSet(await db.industry.findMany({ select: { slug: true } }))),
  authors: createSlugCache(async () => toSlugSet(await db.author.findMany({ select: { slug: true } }))),
  clients: createSlugCache(async () =>
    toSlugSet(
      await db.client.findMany({ where: { subscriptionStatus: "ACTIVE" }, select: { slug: true } }),
    ),
  ),
} as const;

export type LiveSection = keyof typeof caches;

export function isLiveSection(section: string): section is LiveSection {
  return section in caches;
}

/** True when the slug is currently publicly served by its section's page (the only state that should serve a 200). */
export async function isLiveSlug(section: LiveSection, slug: string): Promise<boolean> {
  return caches[section].has(slug);
}

/**
 * In-memory map of permanent (308) redirects: `${section}\n${fromSlug}` → toSlug.
 *
 * Same design rules as the live-slug caches above (module-scoped, 5-minute TTL,
 * dedup concurrent refreshes, NO next/cache — Arabic slugs break its tag header).
 *
 * Records are written by the admin merge action; modonty only reads them, so a
 * fresh redirect becomes effective within one TTL window (same eventual-consistency
 * lag as isLiveSlug after an admin mutation).
 *
 * Fail-CLOSED here (opposite of isLiveSlug): on DB error return an empty map so the
 * caller finds no redirect and falls through to the existing live/410 logic. We must
 * never invent a redirect that isn't in the DB.
 */
/**
 * Total pages of the unfiltered home feed — the proxy's upper bound for `/page/n`
 * (Google, lazy-loading doc: out-of-range page values must return a 404).
 *
 * Same design rules as the slug caches: module-scoped, 5-minute TTL, dedup, no
 * next/cache. Fail-OPEN (Infinity) — on DB error the proxy must pass the request
 * through rather than 404 a page that may exist; the page's own notFound() is the
 * second line of defense. The `where` mirrors the feed query in
 * `article-feed-shapes.ts` — if that filter changes, this count must change with it.
 */
let feedPagesCache: number | null = null;
let feedPagesCachedAt = 0;
let feedPagesInFlight: Promise<number> | null = null;

export async function publishedFeedTotalPages(pageSize: number): Promise<number> {
  const now = Date.now();
  const stale = feedPagesCache === null || now - feedPagesCachedAt > CACHE_TTL_MS;
  if (stale) {
    if (!feedPagesInFlight) {
      feedPagesInFlight = db.article
        .count({
          where: {
            status: "PUBLISHED",
            OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
          },
        })
        .then((total) => {
          feedPagesCache = Math.max(1, Math.ceil(total / pageSize));
          feedPagesCachedAt = Date.now();
          return feedPagesCache;
        })
        .finally(() => {
          feedPagesInFlight = null;
        });
    }
    try {
      return await feedPagesInFlight;
    } catch {
      return Infinity;
    }
  }
  return feedPagesCache!;
}

const redirectKey = (section: string, fromSlug: string) => `${section}\n${fromSlug}`;

let redirectCache: Map<string, string> | null = null;
let redirectCachedAt = 0;
let redirectInFlight: Promise<Map<string, string>> | null = null;

async function loadRedirects(): Promise<Map<string, string>> {
  const rows = await db.redirect.findMany({ select: { section: true, fromSlug: true, toSlug: true } });
  return new Map(rows.map((r) => [redirectKey(r.section, r.fromSlug), r.toSlug]));
}

/** Target slug for a permanent redirect from (section, fromSlug), or null when none exists. */
export async function lookupRedirect(section: LiveSection, fromSlug: string): Promise<string | null> {
  const now = Date.now();
  const stale = !redirectCache || now - redirectCachedAt > CACHE_TTL_MS;

  if (stale) {
    if (!redirectInFlight) {
      redirectInFlight = loadRedirects()
        .then((map) => {
          redirectCache = map;
          redirectCachedAt = Date.now();
          return map;
        })
        .finally(() => {
          redirectInFlight = null;
        });
    }
    try {
      const map = await redirectInFlight;
      return map.get(redirectKey(section, fromSlug)) ?? null;
    } catch {
      // On DB failure, invent no redirect — fall through to the live/410 path.
      return null;
    }
  }

  return redirectCache!.get(redirectKey(section, fromSlug)) ?? null;
}

/** Force-clear all in-memory slug + redirect caches. Call after publish/unpublish/merge mutations if needed. */
export function clearSlugCaches(): void {
  for (const cache of Object.values(caches)) cache.clear();
  redirectCache = null;
  redirectCachedAt = 0;
  redirectInFlight = null;
}
