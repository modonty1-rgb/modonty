import { cache } from 'react';
import { cacheTag, cacheLife } from 'next/cache';
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import type { ArticleResponse, ArticleFilters, InteractionCounts, FeedPost } from "@/lib/types";
import { calculateTrendingScore, getTrendingTimeRange } from "@/lib/trending";
import { FEED_PAGE_SIZE } from "@/lib/feed-constants";
import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { getHomeFeedArticlesCached } from "./home-feed-shapes";

export const getHomeFeedArticles = cache(() => getHomeFeedArticlesCached());
