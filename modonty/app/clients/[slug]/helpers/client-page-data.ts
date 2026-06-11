import { cache } from "react";
import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getClientStats, getRelatedClients } from "./client-stats";

/**
 * Heavy, same-for-everyone client content — partner record + published articles +
 * related partners. Cached cross-request (matches the article-queries.ts convention:
 * cacheLife("hours") + admin revalidateTag("clients"/"articles") on publish/update/delete).
 * Stats are fetched LIVE (in getClientPageData) so follower/view totals never go stale.
 */
async function getClientContentBySlug(decodedSlug: string) {
  "use cache";
  cacheTag("clients");
  cacheTag("articles");
  cacheLife("hours");

  const client = await db.client.findUnique({
    // Only ACTIVE clients are public — PENDING/EXPIRED/CANCELLED → 404.
    where: { slug: decodedSlug, subscriptionStatus: SubscriptionStatus.ACTIVE },
    include: {
        logoMedia: {
          select: {
            url: true,
          },
        },
        heroImageMedia: {
          select: {
            url: true,
          },
        },
        industry: {
          select: {
            name: true,
          },
        },
        articles: {
          where: {
            status: ArticleStatus.PUBLISHED,
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            featuredImage: {
              select: {
                url: true,
                altText: true,
              },
            },
          },
          orderBy: {
            datePublished: "desc",
          },
        },
        _count: {
          select: {
            articles: {
              where: {
                status: ArticleStatus.PUBLISHED,
              },
            },
          },
        },
      },
    });

  if (!client) {
    return null;
  }

  const relatedClients = await getRelatedClients(client.id, client.industryId);
  return { client, relatedClients };
}

/**
 * Shared loader for the client detail section.
 * Centralizes fetching of the main client record, published articles,
 * stats, and related clients so both layout and pages can reuse it.
 * React-cached for per-request dedup (metadata + page). Same return shape as before:
 * cached heavy content + LIVE stats merged.
 */
export const getClientPageData = cache(async (rawSlug: string) => {
  const decodedSlug = decodeURIComponent(rawSlug);

  const content = await getClientContentBySlug(decodedSlug);
  if (!content) {
    return null;
  }

  // Live (uncached) so follower/view totals stay current — same value as before,
  // sourced from the resolved client id.
  const stats = await getClientStats(content.client.id);

  return {
    slug: decodedSlug,
    client: content.client,
    stats,
    relatedClients: content.relatedClients,
  };
});

