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
const NO_REACTIONS = { userLiked: false, userDisliked: false, userFavorited: false } as const;

export async function getMyArticleReactions(articleId: string, userId: string) {
  // The second half of the signed-in-only path (the first is `getViewer`). Reached ONLY when a
  // session resolved, which is why every cookie-less measurement we ran came back green while
  // Khalid kept seeing «المقال ما فتحت» — see the note in `helpers/get-viewer.ts`.
  //
  // Three heart icons are not worth an article: an unreadable reaction state renders as
  // "not reacted", exactly as it does for a signed-out reader.
  try {
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
  } catch (err) {
    console.error(`[article/${articleId}] reactions unavailable, rendering neutral:`, err);
    return { ...NO_REACTIONS };
  }
}
