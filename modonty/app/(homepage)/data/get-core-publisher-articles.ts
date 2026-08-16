import { cache } from 'react';
import { cacheTag, cacheLife } from 'next/cache';
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import type { FeedPost } from "@/lib/types";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";
import { homeFeedSelect, mapHomeFeedArticle } from "./home-feed-shapes";

export const getCorePublisherArticles = cache(async (): Promise<FeedPost[]> => {
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
    select: homeFeedSelect,
    // Newest first, by Khalid's call. `featured` used to sort ahead of the date, so a
    // pinned old article could sit in the hero slot while a fresh one hid below it.
    orderBy: [
      { datePublished: "desc" },
      { id: "desc" },
    ],
    take: 4,
  });

  return articles.map(mapHomeFeedArticle);
});
