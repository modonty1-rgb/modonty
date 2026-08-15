import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { unstable_cache, cacheTag, cacheLife } from "next/cache";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";
import type { CategoryResponse, CategoryAnalytics, CategoryQueryOptions, CategoryArticleQueryOptions, ArticleResponse } from "@/lib/types";

export async function getCategoriesWithCounts(): Promise<CategoryResponse[]> {
  "use cache";
  cacheTag("categories");
  cacheLife("hours");
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: {
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
              OR: [
                { datePublished: null },
                { datePublished: { lte: new Date() } },
              ],
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || undefined,
    seoTitle: category.seoTitle || undefined,
    seoDescription: category.seoDescription || undefined,
    articleCount: category._count?.articles || 0,
  }));
}
