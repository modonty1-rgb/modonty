import { cache } from "react";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getClientStats, getRelatedClients } from "./client-stats";

/**
 * Shared loader for the client detail section.
 * Centralizes fetching of the main client record, published articles,
 * stats, and related clients so both layout and pages can reuse it.
 */
export const getClientPageData = cache(async (rawSlug: string) => {
  const decodedSlug = decodeURIComponent(rawSlug);

  const [client, stats] = await Promise.all([
    db.client.findUnique({
      where: { slug: decodedSlug },
      include: {
        logoMedia: {
          select: {
            url: true,
          },
        },
        ogImageMedia: {
          select: {
            url: true,
          },
        },
        twitterImageMedia: {
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
    }),
    (async () => {
      const tempClient = await db.client.findUnique({
        where: { slug: decodedSlug },
        select: { id: true },
      });
      return tempClient ? getClientStats(tempClient.id) : { followers: 0, totalViews: 0 };
    })(),
  ]);

  if (!client) {
    return null;
  }

  const relatedClients = await getRelatedClients(client.id, client.industryId);

  return {
    slug: decodedSlug,
    client,
    stats,
    relatedClients,
  };
});

