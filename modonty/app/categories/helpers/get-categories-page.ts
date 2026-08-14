import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { unstable_cache, cacheTag, cacheLife } from "next/cache";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";
import type { CategoryResponse, CategoryAnalytics, CategoryQueryOptions, CategoryArticleQueryOptions, ArticleResponse } from "@/lib/types";
import { CATEGORIES_PAGE_SIZE } from "./categories-page-size";
import { getCategoriesEnhanced } from "./get-categories-enhanced";

export async function getCategoriesPage(
  page: number,
  options: CategoryQueryOptions = {}
): Promise<{ items: CategoryResponse[]; hasMore: boolean; total: number }> {
  const all = await getCategoriesEnhanced(options);
  const start = (page - 1) * CATEGORIES_PAGE_SIZE;
  const items = all.slice(start, start + CATEGORIES_PAGE_SIZE);
  return { items, hasMore: start + CATEGORIES_PAGE_SIZE < all.length, total: all.length };
}
