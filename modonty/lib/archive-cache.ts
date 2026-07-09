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
 *   - categories/tags/industries → any existing row renders
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

/** Force-clear all in-memory slug caches. Call after publish/unpublish mutations if needed. */
export function clearSlugCaches(): void {
  for (const cache of Object.values(caches)) cache.clear();
}
