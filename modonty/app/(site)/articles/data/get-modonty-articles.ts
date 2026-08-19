import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";

import type { FeedPost } from "@/lib/types";

/** The card shows one hero plus three titles. */
const MODONTY_CARD_ARTICLES = 4;

/**
 * Modonty's OWN articles, for the card in the left rail — the same card the homepage carries.
 *
 * Modonty publishes under its own `Client` row like any partner, so this is that row's newest
 * work. Only articles WITH an image qualify: the card is built around a hero picture and drops
 * anything it cannot draw.
 */
export async function getModontyArticles(): Promise<FeedPost[]> {
  "use cache";
  cacheTag("articles", "settings");
  cacheLife("hours");

  const coreClientId = await getCoreClientId();
  if (!coreClientId) return [];

  const articles = await db.article.findMany({
    where: {
      clientId: coreClientId,
      status: ArticleStatus.PUBLISHED,
      featuredImageId: { not: null },
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      datePublished: true,
      createdAt: true,
      readingTimeMinutes: true,
      audioUrl: true,
      featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true } },
      client: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ datePublished: "desc" }, { id: "desc" }],
    take: MODONTY_CARD_ARTICLES,
  });

  return articles.map((a) => ({
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
    readingTimeMinutes: a.readingTimeMinutes ?? undefined,
    hasAudio: !!a.audioUrl,
    likes: 0,
    comments: 0,
    favorites: 0,
    views: 0,
    status: "published" as const,
  }));
}
