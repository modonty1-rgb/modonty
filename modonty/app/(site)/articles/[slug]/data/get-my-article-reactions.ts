import { db } from "@/lib/db";

/**
 * This reader's own like / dislike / favourite on one article — never cached, and never read
 * from the page shell.
 *
 * It used to be folded into `getArticleBySlugMinimal`, which meant the article's cached content
 * and this per-reader state came back from one call — and that call needed a userId, so the
 * session had to be read before anything could render. Split out, the article prerenders for
 * everyone and only this travels at request time.
 */
export async function getMyArticleReactions(articleId: string, userId: string) {
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
