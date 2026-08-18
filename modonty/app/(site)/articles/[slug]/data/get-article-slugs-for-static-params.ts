import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

/** Every published slug, for `generateStaticParams`. */
export async function getArticleSlugsForStaticParams() {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");
  return db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: { slug: true },
  });
}
