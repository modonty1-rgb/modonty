/**
 * Site-wide footer stats ("بالأرقام").
 *
 * Honest numbers only: every value is a live COUNT of real records (not the
 * drift-prone denormalized Article.*Count fields). Views span ALL tracked
 * surfaces — articles + client pages today, + every page via PageView (phase B).
 *
 * Cached with cacheLife("minutes") + cacheTag("stats"): the COUNTs run ~once a
 * minute instead of on every request, so the global footer keeps pages
 * static/fast (Core Web Vitals) while staying effectively live. Bust instantly
 * on any engagement via revalidateTag("stats", "max").
 */

import { db } from "@/lib/db";
import { ArticleStatus, CommentStatus, SubscriptionStatus } from "@prisma/client";
import { cacheTag, cacheLife } from "next/cache";

export interface FooterStats {
  articles: number;
  views: number;
  interactions: number;
  likes: number;
  comments: number;
  partners: number;
}

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
    db.client.count({ where: { subscriptionStatus: SubscriptionStatus.ACTIVE } }),
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
