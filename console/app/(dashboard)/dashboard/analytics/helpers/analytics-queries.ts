import { db } from "@/lib/db";

export async function getClientViewCounts(
  clientId: string,
  days: 7 | 30 = 30
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [articleViews, clientViews] = await Promise.all([
    db.articleView.count({
      where: {
        article: { clientId },
        createdAt: { gte: since },
      },
    }),
    db.clientView.count({
      where: {
        clientId,
        createdAt: { gte: since },
      },
    }),
  ]);

  return {
    articleViews,
    clientViews,
    totalViews: articleViews + clientViews,
    periodDays: days,
  };
}
