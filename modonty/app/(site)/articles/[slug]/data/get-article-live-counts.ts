import { cache } from "react";

import { db } from "@/lib/db";

interface ArticleLiveCounts {
  likes: number;
  favorites: number;
  comments: number;
  views: number;
}

/**
 * The article's counters, read live — likes, saves, comments, views.
 *
 * Read ONLY inside the small Suspense islands that show them (reader actions, comments, the
 * header's view count), never on the article's own render path. Plan item أ١ (2 Oct 2026): this
 * read used to sit in `getArticleBySlugMinimal`, awaited before anything rendered, and an
 * uncached database read outside a Suspense boundary takes everything above it out of the
 * prerendered shell (next/dist/docs/01-app/01-getting-started/08-caching.md). Measured on
 * production: the whole article streamed as a postponed hole (`P:5`), its featured image
 * discovered at character 226,595 of a 493KB document — «Resource load delay 1,910ms», LCP 4.1s.
 *
 * `cache()` — one query per request however many islands ask. A failure reads as `null` and the
 * islands keep the cached numbers they were given: a counter must never cost the reader the page.
 */
export const getArticleLiveCounts = cache(async (articleId: string): Promise<ArticleLiveCounts | null> => {
  try {
    const row = await db.article.findUnique({
      where: { id: articleId },
      select: { likesCount: true, favoritesCount: true, commentsCount: true, viewsCount: true },
    });
    if (!row) return null;
    return {
      likes: row.likesCount ?? 0,
      favorites: row.favoritesCount ?? 0,
      comments: row.commentsCount ?? 0,
      views: row.viewsCount ?? 0,
    };
  } catch (err) {
    // Logged, not silent: Vercel's function logs keep it.
    console.error(`[article/${articleId}] live counts unavailable, keeping cached numbers:`, err);
    return null;
  }
});
