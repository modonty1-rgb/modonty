import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus, ClientCtaMode, SubscriptionStatus } from "@prisma/client";
import type { ClientResponse } from "@/lib/types";

export async function getClientsWithCounts(serviceId?: string): Promise<ClientResponse[]> {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");
  const clients = await db.client.findMany({
    // Show ALL active partners — including those with zero published articles yet.
    // Article-less partners surface with a "قريباً" badge (driven by articleCount===0)
    // instead of being hidden. (Reverts the v1.65.5 hide-zero-article rule by design.)
    where: {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      ...(serviceId ? { ctaPresetId: serviceId } : {}),
    },
    include: {
      logoMedia: {
        select: {
          url: true, bunnyUrl: true, blurDataURL: true,
        },
      },
      heroImageMedia: {
        select: {
          url: true, bunnyUrl: true, blurDataURL: true,
        },
      },
      industry: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
              datePublished: { lte: new Date() },
            },
          },
          subscribers: true,
        },
      },
      articles: {
        where: {
          status: ArticleStatus.PUBLISHED,
          datePublished: { lte: new Date() },
        },
        select: {
          viewsCount: true,
          commentsCount: true,
          likesCount: true,
          dislikesCount: true,
          favoritesCount: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return clients.map((client) => {
    const articles = client.articles || [];

    const viewsCount = articles.reduce((sum, article) => sum + (article.viewsCount || 0), 0);
    const commentsCount = articles.reduce((sum, article) => sum + (article.commentsCount || 0), 0);
    const likesCount = articles.reduce((sum, article) => sum + (article.likesCount || 0), 0);
    const dislikesCount = articles.reduce((sum, article) => sum + (article.dislikesCount || 0), 0);
    const favoritesCount = articles.reduce((sum, article) => sum + (article.favoritesCount || 0), 0);

    return {
      id: client.id,
      name: client.name,
      slug: client.slug,
      legalName: client.legalName || undefined,
      description: client.description || client.seoDescription || undefined,
      industry: client.industry || undefined,
      url: client.url || undefined,
      logo: mediaSrc(client.logoMedia) || undefined,
      ogImage: mediaSrc(client.heroImageMedia) || undefined,
      email: client.email || undefined,
      phone: client.phone || undefined,
      seoTitle: client.seoTitle || undefined,
      seoDescription: client.seoDescription || undefined,
      articleCount: client._count?.articles || 0,
      viewsCount,
      subscribersCount: client._count?.subscribers || 0,
      commentsCount,
      likesCount,
      dislikesCount,
      favoritesCount,
      subscriptionTier: client.subscriptionTier || undefined,
      createdAt: client.createdAt,
      isVerified: client.subscriptionTier === 'PRO' || client.subscriptionTier === 'PREMIUM',
      isFeatured: client.isFeatured, // featured/premium partner spotlight (admin toggle)
      ctaMode: client.ctaMode,
      ctaLabel: client.ctaLabel || undefined,
      ctaUrl: client.ctaUrl || undefined,
    };
  });
}
