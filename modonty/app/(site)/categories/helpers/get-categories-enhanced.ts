import { mediaSrc } from "@modonty/shared/lib/media-src";
// The uncached shared reader, not `@/lib/settings/get-core-client-id`: this body runs inside
// `unstable_cache`, which is not a `"use cache"` scope. One tiny Settings read per cache miss.
import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { db } from "@/lib/db";
import { ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";
import type { CategoryResponse, CategoryQueryOptions } from "@/lib/types";

export const getCategoriesEnhanced = unstable_cache(
  async (
    options: CategoryQueryOptions & { includeEmpty?: boolean } = {},
  ): Promise<CategoryResponse[]> => {
    const { search, sortBy = 'articles', featured, includeEmpty = false } = options;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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
        articles: {
          where: {
            status: ArticleStatus.PUBLISHED,
            datePublished: {
              gte: sevenDaysAgo,
              lte: new Date(),
            },
          },
          select: {
            likesCount: true,
            commentsCount: true,
            favoritesCount: true,
          },
        },
      },
    });

    let results: CategoryResponse[] = categories.map((category) => {
      const articleCount = category._count?.articles || 0;
      const recentArticleCount = category.articles?.length || 0;
      
      const totalEngagement = category.articles?.reduce((sum, article) => {
        return sum +
          (article.likesCount || 0) +
          (article.commentsCount || 0) +
          (article.favoritesCount || 0);
      }, 0) || 0;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
        seoTitle: category.seoTitle || undefined,
        seoDescription: category.seoDescription || undefined,
        socialImage: category.socialImage || undefined,
        socialImageAlt: category.socialImageAlt || undefined,
        articleCount,
        recentArticleCount,
        totalEngagement,
        isFeatured: false,
      };
    });

    results.sort((a, b) => b.articleCount - a.articleCount);
    results.forEach((cat, index) => {
      cat.isFeatured = index < 4;
    });

    // Batch-fetch client previews — one query for ALL categories (no N+1)
    const categoryIds = categories.map((c) => c.id);
    if (categoryIds.length > 0) {
      // Modonty publishes here too, but it is the platform, not one of the partners it lists —
      // so it is excluded from the partner avatars and the «شريك» count on the category card
      // (its ARTICLES stay in every count and every feed). Same rule `/clients` and the
      // platform counters already apply; `Settings.coreClientId` is the only switch.
      const coreClientId = await getCoreClientId();
      const activePartner = {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        ...(coreClientId ? { id: { not: coreClientId } } : {}),
      };
      // Independent of each other — run in parallel (GA4 is a network call, the slower of the two).
      const [clientRows, clientGA4] = await Promise.all([
        db.article.findMany({
          where: {
            categoryId: { in: categoryIds },
            status: ArticleStatus.PUBLISHED,
            OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
            client: activePartner,
          },
          select: {
            categoryId: true,
            client: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
              },
            },
          },
          orderBy: { datePublished: "desc" },
          take: 500,
        }),
        getClientsGA4Stats(),
      ]);

      const previewsMap = new Map<string, { id: string; name: string; logoUrl?: string }[]>();
      const countMap = new Map<string, number>();
      const clientSlugsMap = new Map<string, string[]>();
      const seenPairs = new Set<string>();

      for (const row of clientRows) {
        const catId = row.categoryId;
        const clientId = row.client.id;
        if (!catId || !clientId) continue;

        const pairKey = `${catId}:${clientId}`;
        if (seenPairs.has(pairKey)) continue;
        seenPairs.add(pairKey);

        const existing = previewsMap.get(catId) ?? [];
        previewsMap.set(catId, existing);
        countMap.set(catId, (countMap.get(catId) ?? 0) + 1);
        if (existing.length < 3) {
          existing.push({
            id: clientId,
            name: row.client.name,
            logoUrl: mediaSrc(row.client.logoMedia) ?? undefined,
          });
        }

        const slugs = clientSlugsMap.get(catId) ?? [];
        clientSlugsMap.set(catId, slugs);
        slugs.push(row.client.slug);
      }

      // "الأثر الرقمي" = sum of every category client's own digital-impact total (GA4 + DB engagement).
      results = results.map((cat) => {
        const slugs = clientSlugsMap.get(cat.id) ?? [];
        const digitalImpact = slugs.reduce((sum, slug) => sum + (clientGA4[slug]?.total ?? 0), 0);
        return {
          ...cat,
          clientPreviews: previewsMap.get(cat.id) ?? [],
          clientCount: countMap.get(cat.id) ?? 0,
          digitalImpact,
        };
      });
    }

    // Hide empty categories — nothing to show a visitor if there are neither
    // published articles nor active partners (applies to both the listing and
    // the "related categories" widget). Runs before search/sort/pagination so
    // hero counts + page slices reflect only content-bearing categories.
    if (!includeEmpty) {
      results = results.filter((cat) => cat.articleCount > 0 || (cat.clientCount ?? 0) > 0);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchLower) ||
          cat.description?.toLowerCase().includes(searchLower)
      );
    }

    if (featured) {
      results = results.filter((cat) => cat.isFeatured);
    }

    switch (sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      case 'articles':
        results.sort((a, b) => b.articleCount - a.articleCount);
        break;
      case 'trending':
        results.sort((a, b) => (b.recentArticleCount || 0) - (a.recentArticleCount || 0));
        break;
      case 'recent':
        results.sort((a, b) => (b.totalEngagement || 0) - (a.totalEngagement || 0));
        break;
      default:
        results.sort((a, b) => b.articleCount - a.articleCount);
    }

    return results;
  },
  ['categories-enhanced'],
  {
    revalidate: 3600,
    tags: ['categories'],
  }
);
