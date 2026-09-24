import { db } from "@/lib/db";
import { getPlatformCounts } from "@/lib/queries/get-platform-counts";
import { ArticleStatus, CommentStatus } from "@prisma/client";
import { cacheTag, cacheLife } from "next/cache";
import { FooterStats } from "./footer-stats-types";

export async function getFooterStats(): Promise<FooterStats> {
  "use cache";
  cacheTag("stats");
  cacheLife("minutes");

  const now = new Date();
  const publishedFilter = {
    status: ArticleStatus.PUBLISHED,
    OR: [{ datePublished: null }, { datePublished: { lte: now } }],
  };

  const [
    articles,
    partners,
    articleViews,
    clientViews,
    pageViews,
    articleLikes,
    clientLikes,
    articleComments,
    clientComments,
    articleFavorites,
    clientFavorites,
    clientReviews,
  ] = await Promise.all([
    db.article.count({ where: publishedFilter }),
    // الشريكُ كلُّ عميلٍ ظاهرٍ على الموقع، نُشر له مقالٌ أم لا (خالد ٢٤ سبتمبر ٢٠٢٦) — من
    // `getPlatformCounts` الواحد الذي يقرؤه كرتُ «شركاء موثوقون» وتطابقه قائمةُ `/clients`.
    getPlatformCounts().then((c) => c.partners),
    db.articleView.count(),
    db.clientView.count(),
    db.pageView.count(),
    db.articleLike.count(),
    db.clientLike.count(),
    db.comment.count({ where: { status: CommentStatus.APPROVED } }),
    db.clientComment.count({ where: { status: CommentStatus.APPROVED } }),
    db.articleFavorite.count(),
    db.clientFavorite.count(),
    db.clientReview.count({ where: { status: CommentStatus.APPROVED } }),
  ]);

  // Views across ALL surfaces: articles + client pages (own tables) + every other
  // page (PageView). No overlap — PageView excludes /articles & /clients.
  const views = articleViews + clientViews + pageViews;
  const likes = articleLikes + clientLikes;
  const comments = articleComments + clientComments;
  const favorites = articleFavorites + clientFavorites;
  const interactions = likes + comments + favorites + clientReviews;

  return { articles, views, interactions, likes, comments, partners };
}
