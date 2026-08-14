import { cache } from 'react';
import { cacheTag, cacheLife } from 'next/cache';
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import type { ArticleResponse, ArticleFilters, InteractionCounts, FeedPost } from "@/lib/types";
import { calculateTrendingScore, getTrendingTimeRange } from "@/lib/trending";
import { FEED_PAGE_SIZE } from "@/lib/feed-constants";
import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { homeFeedSelect, mapHomeFeedArticle } from "./home-feed-shapes";

export const getCorePublisherArticles = cache(async (): Promise<FeedPost[]> => {
  "use cache";
  cacheTag("articles", "settings");
  cacheLife("hours");

  const coreClientId = await getCoreClientId();
  if (!coreClientId) return [];

  const articles = await db.article.findMany({
    where: {
      clientId: coreClientId,
      status: ArticleStatus.PUBLISHED,
      featuredImageId: { not: null },
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: homeFeedSelect,
    orderBy: [
      { featured: "desc" },
      { datePublished: "desc" },
      { id: "desc" },
    ],
    take: 5,
  });

  return articles.map(mapHomeFeedArticle);
});
