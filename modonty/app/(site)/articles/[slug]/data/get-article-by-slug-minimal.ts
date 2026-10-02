import { getArticleContentBySlug } from "./get-article-content-by-slug";

/**
 * The article as the page first renders it — the cached content only, so the whole article
 * prerenders into the static shell. Comments and FAQs arrive later; the section headers only
 * need `_count`.
 *
 * The counts here are the cached row's own counters. Plan item أ١ (2 Oct 2026): this function
 * used to add a LIVE counts read before returning, and that one uncached query took the entire
 * article out of the prerendered shell — on production it streamed as a postponed hole and the
 * featured image (the phone's LCP) was discovered 1.9s late. The live numbers now stream into
 * the islands that show them (`getArticleLiveCounts`), each behind its own Suspense boundary
 * with these cached numbers as the fallback.
 *
 * Invariant since 1 Sep 2026, still true: if `getArticleContentBySlug` resolves, this resolves.
 */
export async function getArticleBySlugMinimal(slug: string) {
  const article = await getArticleContentBySlug(slug);
  if (!article) return null;

  const { likesCount, dislikesCount, favoritesCount, commentsCount, viewsCount, _count, ...rest } = article;

  return {
    ...rest,
    faqs: [],
    comments: [],
    _count: {
      faqs: _count.faqs,
      likes: likesCount ?? 0,
      dislikes: dislikesCount ?? 0,
      favorites: favoritesCount ?? 0,
      comments: commentsCount ?? 0,
      views: viewsCount ?? 0,
    },
  };
}
