import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function getPendingArticlesCount(clientId: string): Promise<number> {
  return db.article.count({
    where: {
      clientId,
      status: ArticleStatus.AWAITING_APPROVAL,
    },
  });
}
