import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus, ClientCtaMode, SubscriptionStatus } from "@prisma/client";
import type { ClientResponse } from "@/lib/types";
import { ClientSortOption, clientOrderBy } from "./client-sort";

export async function getClientsSearch(
  search: string,
  limit = 10,
  sortBy: ClientSortOption = "name-asc"
): Promise<ClientResponse[]> {
  "use cache";
  cacheTag("clients");
  cacheLife("minutes");
  const trimmed = search.trim();
  if (!trimmed) return [];
  const orderBy = clientOrderBy(sortBy);
  const clients = await db.client.findMany({
    where: {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { legalName: { contains: trimmed, mode: "insensitive" } },
        { description: { contains: trimmed, mode: "insensitive" } },
        { seoDescription: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    include: {
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      industry: { select: { id: true, name: true, slug: true } },
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
    orderBy,
    take: limit,
  });
  return clients.map((client) => {
    const articles = client.articles || [];
    const viewsCount = articles.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
    const commentsCount = articles.reduce((sum, a) => sum + (a.commentsCount || 0), 0);
    const likesCount = articles.reduce((sum, a) => sum + (a.likesCount || 0), 0);
    const dislikesCount = articles.reduce((sum, a) => sum + (a.dislikesCount || 0), 0);
    const favoritesCount = articles.reduce((sum, a) => sum + (a.favoritesCount || 0), 0);
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
      isVerified: client.subscriptionTier === "PRO" || client.subscriptionTier === "PREMIUM",
    };
  });
}
