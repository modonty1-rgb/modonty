import { db } from "@/lib/db";
import { ArticleFAQStatus } from "@prisma/client";
import { readerSourceFilter } from "@/lib/questions/reader-source-filter";

export async function getPendingQuestionsCount(
  clientId: string
): Promise<number> {
  return db.articleFAQ.count({
    where: {
      article: { clientId },
      ...readerSourceFilter(),
      status: ArticleFAQStatus.PENDING,
    },
  });
}
