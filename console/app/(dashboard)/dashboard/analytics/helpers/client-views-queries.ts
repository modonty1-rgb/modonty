import { db } from "@/lib/db";

export async function getClientViewsAnalytics(
  clientId: string,
  days: 7 | 30 | 90 = 30
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [clientViews, uniqueVisitors, referrers] = await Promise.all([
    db.clientView.count({
      where: {
        clientId,
        createdAt: { gte: since },
      },
    }),
    db.clientView.findMany({
      where: {
        clientId,
        createdAt: { gte: since },
      },
      select: { sessionId: true, userId: true },
      distinct: ["sessionId"],
    }),
    db.clientView.groupBy({
      by: ["referrer"],
      where: {
        clientId,
        createdAt: { gte: since },
        referrer: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    }),
  ]);

  return {
    totalViews: clientViews,
    uniqueVisitors: uniqueVisitors.length,
    topReferrers: referrers.map((r) => ({
      referrer: r.referrer || "Direct",
      views: r._count.id,
    })),
  };
}
