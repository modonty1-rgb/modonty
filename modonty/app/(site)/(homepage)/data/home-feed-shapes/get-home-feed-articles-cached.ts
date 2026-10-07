import { cacheTag, cacheLife } from "next/cache";
import { HOMEPAGE_ARTICLE_ORDER } from "@modonty/shared/lib/articles/homepage-article-order";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import type { FeedPost } from "@/lib/types";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";
import { homeFeedSelect } from "./home-feed-select";
import { mapHomeFeedArticle } from "./map-home-feed-article";

export async function getHomeFeedArticlesCached(): Promise<FeedPost[]> {
  "use cache";
  cacheTag("articles");
  cacheLife("hours"); // safe: admin revalidateTag("articles") fires on every publish/update/delete

  const articles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: homeFeedSelect,
    // اختياراتُ الأدمن بترتيبها ثم الأحدث — `HOMEPAGE_ARTICLE_ORDER` الواحد.
    orderBy: HOMEPAGE_ARTICLE_ORDER,
    take: FEED_PAGE_SIZE,
  });

  // One extra read per query, cached with the articles — every card downstream then knows
  // whether modonty wrote it, without the card asking the database.
  const coreClientId = await getCoreClientId();
  return articles.map((a) => mapHomeFeedArticle(a, coreClientId));
}
