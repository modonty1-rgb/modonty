import { cache } from 'react';
import { cacheTag, cacheLife } from 'next/cache';
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import type { ArticleResponse, ArticleFilters, InteractionCounts, FeedPost } from "@/lib/types";
import { calculateTrendingScore, getTrendingTimeRange } from "@/lib/trending";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { feedArticleSelect, mapFeedArticleToResponse } from "@/lib/queries/article-feed-shapes";

/**
 * Get trending articles with time-weighted scoring
 * Cached for 1 hour
 */
export const getTrendingArticles = cache(async (limit: number = 10, days: number = 7) => {
  const timeRange = getTrendingTimeRange(days);

  const articles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
      createdAt: { gte: timeRange },
    },
    select: feedArticleSelect,
    take: 100, // Fetch more for scoring
  });

  // Calculate trending scores
  const articlesWithScores = articles.map((article) => {
    const trendingData = calculateTrendingScore(
      {
        views: article.viewsCount || 0,
        likes: article.likesCount || 0,
        comments: article.commentsCount || 0,
        favorites: article.favoritesCount || 0,
      },
      article.createdAt
    );

    return {
      article,
      trendingScore: trendingData.score,
    };
  });

  // Sort by trending score and take top N
  const topTrending = articlesWithScores
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit)
    .map((item) => mapFeedArticleToResponse(item.article));

  return topTrending;
});
