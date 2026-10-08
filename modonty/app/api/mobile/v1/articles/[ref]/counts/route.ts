import { getArticleBySlugMinimal } from "@/app/(site)/articles/[slug]/data";
import { getArticleLiveCounts } from "@/app/(site)/articles/[slug]/data/get-article-live-counts";
import { getMyArticleReactions } from "@/app/(site)/articles/[slug]/data/get-my-article-reactions";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";

/**
 * C5 — GET /api/mobile/v1/articles/:slug/counts · public, Bearer optional · no-store.
 * Live counters (`getArticleLiveCounts`, the islands' read) and — with a valid Bearer — this
 * reader's like/dislike/save (`getMyArticleReactions`). When the live read fails the web keeps
 * the cached numbers; so does this endpoint.
 */
export const GET = handle("article-counts", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.articleNotFound);

  const article = await getArticleBySlugMinimal(slug);
  if (!article) return fail("NOT_FOUND", MESSAGES.articleNotFound);

  const [live, reader] = await Promise.all([getArticleLiveCounts(article.id), readerFromRequest(request)]);
  const counts = live ?? {
    likes: article._count.likes,
    favorites: article._count.favorites,
    comments: article._count.comments,
    views: article._count.views,
  };

  if (!reader) return ok({ articleId: article.id, counts, me: null });

  const mine = await getMyArticleReactions(article.id, reader.id);
  return ok({
    articleId: article.id,
    counts,
    me: { liked: mine.userLiked, disliked: mine.userDisliked, favorited: mine.userFavorited },
  });
});
