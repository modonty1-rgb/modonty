import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";

// The count reads the clock (scheduled articles), and Next 16 forbids the current time in an
// uncached prerender scope — so it lives in its own cached function, like getTagForMetadata.
export async function countTagArticles(slug: string) {
  "use cache";
  cacheTag("tags");
  cacheLife("hours");
  return db.article.count({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
      tags: { some: { tag: { slug } } },
    },
  });
}
