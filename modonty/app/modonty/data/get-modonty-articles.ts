import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import type { FeedPost } from "@/lib/types";

const modontyArticleSelect = {
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

type ModontyArticlePayload = Prisma.ArticleGetPayload<{ select: typeof modontyArticleSelect }>;

function mapModontyArticle(a: ModontyArticlePayload): FeedPost {
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
 * modonty's own published articles — modonty publishes under its own `Client` row like
 * any partner (Khalid, 2026-08-16: «من الـID هذا حنجيب كل ما يخص مدونتي»), so this is the
 * same shape as `getClientArticles` would be for any partner, keyed to modonty's id.
 */
export async function getModontyArticles(clientId: string): Promise<FeedPost[]> {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");

  const articles = await db.article.findMany({
    where: {
      clientId,
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: modontyArticleSelect,
    orderBy: [{ datePublished: "desc" }, { id: "desc" }],
    take: 100,
  });

  return articles.map(mapModontyArticle);
}
