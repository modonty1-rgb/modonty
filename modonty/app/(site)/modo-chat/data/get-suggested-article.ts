import "server-only";

import { db } from "@/lib/db";

/** The one article offered under «هل تريد قراءة أعمق؟», by id. */
export async function getSuggestedArticle(id: string) {
  return db.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      client: { select: { id: true, name: true, slug: true } },
    },
  });
}
