import { mediaSrc } from "@modonty/shared/lib/media-src";
// Uncached shared reader — this body runs inside `unstable_cache`, not a `"use cache"` scope.
import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { db } from "@/lib/db";
import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";
import { TagListItem, TagQueryOptions } from "./tag-types";

/**
 * Tag listing for /tags — same shape as getCategoriesEnhanced, previews fetched
 * via the ArticleTag junction table instead of a direct categoryId column.
 * Tag counts are small (tens, not thousands) so computing the full enriched
 * list once and slicing per page is simpler than a DB-level cursor and costs
 * nothing extra in practice.
 */
export const getTagsEnhanced = unstable_cache(
  async (options: TagQueryOptions = {}): Promise<TagListItem[]> => {
    const { search, sortBy = "articles" } = options;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tags = await db.tag.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        socialImage: true,
        socialImageAlt: true,
        _count: {
          select: {
            articles: {
              where: {
                article: {
                  status: ArticleStatus.PUBLISHED,
                  OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
                },
              },
            },
          },
        },
        articles: {
          where: {
            article: {
              status: ArticleStatus.PUBLISHED,
              datePublished: { gte: sevenDaysAgo, lte: new Date() },
            },
          },
          select: { id: true },
        },
      },
    });

    let results: TagListItem[] = tags
      .filter((t) => t._count.articles > 0)
      .map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        socialImage: t.socialImage || undefined,
        socialImageAlt: t.socialImageAlt || undefined,
        articleCount: t._count.articles,
        recentArticleCount: t.articles.length,
        clientPreviews: [],
        clientCount: 0,
        digitalImpact: 0,
      }));

    // Batch-fetch client previews via the ArticleTag junction — one query for ALL tags (no N+1)
    const tagIds = results.map((t) => t.id);
    if (tagIds.length > 0) {
      // Modonty is the platform, not a listed partner: it is out of the avatars and the
      // «شريك» count on the tag card, while its articles stay in every count and feed.
      const coreClientId = await getCoreClientId();
      const activePartner = {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        ...(coreClientId ? { id: { not: coreClientId } } : {}),
      };
      // Independent of each other — run in parallel (GA4 is a network call, the slower of the two).
      const [clientRows, clientGA4] = await Promise.all([
        db.articleTag.findMany({
          where: {
            tagId: { in: tagIds },
            article: {
              status: ArticleStatus.PUBLISHED,
              OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
              client: activePartner,
            },
          },
          select: {
            tagId: true,
            article: {
              select: {
                client: {
                  select: { id: true, name: true, slug: true, logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } } },
                },
              },
            },
          },
          take: 2000,
        }),
        getClientsGA4Stats(),
      ]);

      const previewsMap = new Map<string, { id: string; name: string; logoUrl?: string }[]>();
      const countMap = new Map<string, number>();
      const clientSlugsMap = new Map<string, string[]>();
      const seenPairs = new Set<string>();

      for (const row of clientRows) {
        const clientId = row.article.client.id;
        const pairKey = `${row.tagId}:${clientId}`;
        if (seenPairs.has(pairKey)) continue;
        seenPairs.add(pairKey);

        const existing = previewsMap.get(row.tagId) ?? [];
        previewsMap.set(row.tagId, existing);
        countMap.set(row.tagId, (countMap.get(row.tagId) ?? 0) + 1);
        if (existing.length < 3) {
          existing.push({
            id: clientId,
            name: row.article.client.name,
            logoUrl: mediaSrc(row.article.client.logoMedia) ?? undefined,
          });
        }

        const slugs = clientSlugsMap.get(row.tagId) ?? [];
        clientSlugsMap.set(row.tagId, slugs);
        slugs.push(row.article.client.slug);
      }

      // "الأثر الرقمي" = sum of every tagged client's own GA4 total, not traffic to /tags/[slug] itself.
      results = results.map((tag) => {
        const slugs = clientSlugsMap.get(tag.id) ?? [];
        const digitalImpact = slugs.reduce((sum, slug) => sum + (clientGA4[slug]?.total ?? 0), 0);
        return {
          ...tag,
          clientPreviews: previewsMap.get(tag.id) ?? [],
          clientCount: countMap.get(tag.id) ?? 0,
          digitalImpact,
        };
      });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter((t) => t.name.toLowerCase().includes(searchLower));
    }

    switch (sortBy) {
      case "name":
        results.sort((a, b) => a.name.localeCompare(b.name, "ar"));
        break;
      case "trending":
        results.sort((a, b) => b.recentArticleCount - a.recentArticleCount);
        break;
      case "articles":
      default:
        results.sort((a, b) => b.articleCount - a.articleCount);
    }

    return results;
  },
  ["tags-enhanced"],
  { revalidate: 3600, tags: ["tags"] }
);
