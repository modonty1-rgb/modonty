import { cache } from 'react';
import { cacheTag, cacheLife } from 'next/cache';
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import type { ArticleResponse, ArticleFilters, InteractionCounts, FeedPost } from "@/lib/types";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";
import { getHomeFeedArticlesCached } from "./home-feed-shapes";

export const getHomeFeedArticles = cache(() => getHomeFeedArticlesCached());
