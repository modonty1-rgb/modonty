import { db } from "@/lib/db";
import type { FaqStats } from "./faq-stats";

export async function getFaqStats(clientId: string): Promise<FaqStats> {
  const [pending, published, rejected, fromReaders] = await Promise.all([
    db.articleFAQ.count({ where: { article: { clientId }, status: "PENDING" } }),
    db.articleFAQ.count({
      where: { article: { clientId }, status: "PUBLISHED" },
    }),
    db.articleFAQ.count({
      where: { article: { clientId }, status: "REJECTED" },
    }),
    db.articleFAQ.count({
      where: {
        article: { clientId },
        OR: [{ source: "chatbot" }, { source: "user" }],
      },
    }),
  ]);
  return {
    pending,
    published,
    rejected,
    total: pending + published + rejected,
    fromReaders,
  };
}
