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

  // `isCore` is left false on purpose: every article in THIS list is modonty's, so a badge
  // that marks all of them marks none. The flag exists to single one out inside a mixed feed.
  // Wrapped rather than passed by reference — bare `.map(fn)` hands the index to the second
  // parameter, which is the `coreClientId` slot (caught by tsc, 24 Aug).
  return articles.map((a) => mapHomeFeedArticle(a));
});
