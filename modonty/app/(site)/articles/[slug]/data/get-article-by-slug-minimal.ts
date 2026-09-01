import { db } from "@/lib/db";

import { getArticleContentBySlug } from "./get-article-content-by-slug";

/**
 * Live aggregate counts — kept OUT of the cache so like/view/comment totals stay current.
 *
 * Wrapped by `getArticleLiveCountsSafe` below: a like tally is decoration, and it must never be
 * able to take an article down. See the note there.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept, unused during the isolation experiment
async function getArticleLiveCounts(articleId: string) {
  return db.article.findUnique({
    where: { id: articleId },
    select: {
      likesCount: true,
      dislikesCount: true,
      favoritesCount: true,
      commentsCount: true,
      viewsCount: true,
      _count: { select: { faqs: true } },
    },
  });
}

/**
 * The counts, but unable to break the page.
 *
 * THE BUG THIS CLOSES (measured 1 Sep 2026): the article's own content is cached
 * (`getArticleContentBySlug`, `use cache` + `cacheTag("articles")`), yet the page still awaited
 * this LIVE MongoDB read before it could render anything. So a cached, healthy, fully-available
 * article was hostage to one query for a like tally — and when that query's connection dropped,
 * React's Flight stream ended early («Connection closed.»), the render threw, and the reader got
 * «المقال ما فتحت» on an article that was sitting in cache the whole time. The error boundary
 * fired live at 07:47 while the same URL answered HTTP 200 with 669KB seconds later.
 *
 * The counts are decoration: likes and favourites, consumed only inside `<ReaderActions>`, which
 * already sits in its own `<Suspense>`. Nothing about the article's text, images, metadata or
 * JSON-LD depends on them. So the correct failure mode is a zero, not a dead page.
 *
 * `catch` here — not a retry, not a rethrow: a retry doubles the latency on a connection that is
 * already unhealthy, and a rethrow is exactly the behaviour being removed.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept, unused during the isolation experiment
async function getArticleLiveCountsSafe(articleId: string) {
  try {
    return await getArticleLiveCounts(articleId);
  } catch (err) {
    // Logged, not silent: `instrumentation.ts` never sees this because we swallow it here, so
    // this console line is the only trace. Vercel's function logs keep it.
    console.error(`[article/${articleId}] live counts unavailable, serving zeros:`, err);
    return null;
  }
}

/** Live per-user reaction state — never cached; reads only this user's like/dislike/favorite. */
async function getMyArticleReactions(articleId: string, userId: string) {
  const a = await db.article.findUnique({
    where: { id: articleId },
    select: {
      likes: { where: { userId }, take: 1, select: { id: true } },
      dislikes: { where: { userId }, take: 1, select: { id: true } },
      favorites: { where: { userId }, take: 1, select: { id: true } },
    },
  });
  return {
    userLiked: (a?.likes.length ?? 0) > 0,
    userDisliked: (a?.dislikes.length ?? 0) > 0,
    userFavorited: (a?.favorites.length ?? 0) > 0,
  };
}

/** Same guard as the counts: a failed reaction lookup reads as "not reacted", never as an outage. */
async function getMyArticleReactionsSafe(articleId: string, userId: string) {
  try {
    return await getMyArticleReactions(articleId, userId);
  } catch (err) {
    console.error(`[article/${articleId}] reactions unavailable, serving neutral state:`, err);
    return { userLiked: false, userDisliked: false, userFavorited: false };
  }
}

/**
 * The article as the page first renders it: cached heavy content, plus live counts, plus this
 * visitor's own reactions. Comments and FAQs arrive later — the section headers only need `_count`.
 *
 * Invariant since 1 Sep 2026: if `getArticleContentBySlug` resolves, this function RESOLVES.
 * Everything after that first line is decoration and is individually guarded, so the reader gets
 * the article whenever the article exists — never an error card for a healthy, cached page.
 */
export async function getArticleBySlugMinimal(slug: string, userId?: string) {
  const article = await getArticleContentBySlug(slug);
  if (!article) return null;

  // ⚠️ ISOLATION EXPERIMENT — 1 Sep 2026, one variable, revert after the measurement.
  //
  // Hypothesis under test: this LIVE counts query is what kills the article render. The article
  // itself is cached, yet the page cannot paint a single byte until this uncached MongoDB read
  // resolves — and when it stalls on a cold connection the Flight stream ends («Connection
  // closed.»), boundary B:4 (the whole page) is rejected, and a healthy cached article is served
  // as a 200 with no body, which then gets CACHED and handed to every visitor for five minutes.
  //
  // The guard added on 31 Aug catches a THROW from the query. It cannot catch a stream that ends
  // while the query is still pending — which is the failure actually observed in the Vercel logs.
  // So guarding is not enough; the read has to leave the critical path entirely.
  //
  // Nothing is lost meanwhile: `getArticleContentBySlug` already carries likes, dislikes,
  // comments and the FAQ count in its cached payload. Only favourites and views fall back to
  // zero for the duration of this test.
  const reactions = userId
    ? await getMyArticleReactionsSafe(article.id, userId)
    : { userLiked: false, userDisliked: false, userFavorited: false };

  const { likesCount, dislikesCount, favoritesCount, commentsCount, viewsCount, ...rest } = article;

  return {
    ...rest,
    faqs: [],
    comments: [],
    userLiked: reactions.userLiked,
    userDisliked: reactions.userDisliked,
    userFavorited: reactions.userFavorited,
    // Read from the CACHED payload during the isolation experiment — no live query on this path.
    _count: {
      faqs: article._count?.faqs ?? 0,
      likes: likesCount ?? 0,
      dislikes: dislikesCount ?? 0,
      favorites: favoritesCount ?? 0,
      comments: commentsCount ?? 0,
      views: viewsCount ?? 0,
    },
  };
}
