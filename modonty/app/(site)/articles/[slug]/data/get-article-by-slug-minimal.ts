import { db } from "@/lib/db";

import { getArticleContentBySlug } from "./get-article-content-by-slug";

/** Live aggregate counts — kept OUT of the cache so like/view/comment totals stay current. */
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

/**
 * The article as the page first renders it: cached heavy content, plus live counts, plus this
 * visitor's own reactions. Comments and FAQs arrive later — the section headers only need `_count`.
 */
export async function getArticleBySlugMinimal(slug: string, userId?: string) {
  const article = await getArticleContentBySlug(slug);
  if (!article) return null;

  const [counts, reactions] = await Promise.all([
    getArticleLiveCounts(article.id),
    userId
      ? getMyArticleReactions(article.id, userId)
      : Promise.resolve({ userLiked: false, userDisliked: false, userFavorited: false }),
  ]);

  const { likesCount, dislikesCount, favoritesCount, commentsCount, viewsCount, ...rest } = article;

  return {
    ...rest,
    faqs: [],
    comments: [],
    userLiked: reactions.userLiked,
    userDisliked: reactions.userDisliked,
    userFavorited: reactions.userFavorited,
    _count: {
      faqs: counts?._count.faqs ?? 0,
      likes: counts?.likesCount ?? 0,
      dislikes: counts?.dislikesCount ?? 0,
      favorites: counts?.favoritesCount ?? 0,
      comments: counts?.commentsCount ?? 0,
      views: counts?.viewsCount ?? 0,
    },
  };
}
