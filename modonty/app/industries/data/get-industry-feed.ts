import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus, SubscriptionStatus } from "@prisma/client";
import type { FeedPost } from "@/lib/types";

const industryFeedSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  datePublished: true,
  createdAt: true,
  readingTimeMinutes: true,
  client: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
    },
  },
  featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true } },
  audioUrl: true,
  likesCount: true,
  commentsCount: true,
  favoritesCount: true,
  viewsCount: true,
} satisfies Prisma.ArticleSelect;

type IndustryFeedPayload = Prisma.ArticleGetPayload<{ select: typeof industryFeedSelect }>;

function mapIndustryFeedArticle(a: IndustryFeedPayload): FeedPost {
  return {
    id: a.id,
    title: a.title,
    excerpt: a.excerpt ?? undefined,
    image: mediaSrc(a.featuredImage) ?? undefined,
    imageBlur: a.featuredImage?.blurDataURL ?? undefined,
    slug: a.slug,
    publishedAt: a.datePublished || a.createdAt,
    clientName: a.client.name,
    clientSlug: a.client.slug,
    clientId: a.client.id,
    clientLogo: mediaSrc(a.client.logoMedia) ?? undefined,
    readingTimeMinutes: a.readingTimeMinutes ?? undefined,
    hasAudio: !!a.audioUrl,
    likes: a.likesCount || 0,
    comments: a.commentsCount || 0,
    favorites: a.favoritesCount || 0,
    views: a.viewsCount || 0,
    status: "published",
  };
}

/**
 * Every published article from an active partner who has an industry — cached per
 * industry id, or once for the combined feed when none is given (the base `/industries`
 * page). Paginated in memory on the page (mirrors `getClientsList` on `/clients`: one
 * bounded fetch, sliced per chunk, instead of a skip/take round-trip per page).
 */
export async function getIndustryFeed(industryId?: string): Promise<FeedPost[]> {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");

  const articles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
      client: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        industryId: industryId ?? { not: null },
      },
    },
    select: industryFeedSelect,
    orderBy: [{ datePublished: "desc" }, { id: "desc" }],
    take: 200,
  });

  return articles.map(mapIndustryFeedArticle);
}
