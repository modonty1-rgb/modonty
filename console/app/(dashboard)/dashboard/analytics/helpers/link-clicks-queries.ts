import { db } from "@/lib/db";
import { LinkType } from "@prisma/client";

export interface LinkClickData {
  linkUrl: string;
  linkText: string | null;
  linkType: LinkType;
  linkDomain: string | null;
  clicks: number;
  uniqueUsers: number;
}

export async function getTopClickedLinks(
  clientId: string,
  days: 7 | 30 | 90 = 30,
  limit: number = 10
): Promise<LinkClickData[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const linkClicks = await db.articleLinkClick.groupBy({
    by: ["linkUrl", "linkText", "linkType", "linkDomain"],
    where: {
      article: { clientId },
      createdAt: { gte: since },
    },
    _count: {
      id: true,
    },
  });

  const linksWithUniqueUsers = await Promise.all(
    linkClicks.map(async (link) => {
      const uniqueUsers = await db.articleLinkClick.findMany({
        where: {
          article: { clientId },
          linkUrl: link.linkUrl,
          createdAt: { gte: since },
        },
        select: { userId: true, sessionId: true },
        distinct: ["sessionId"],
      });

      return {
        linkUrl: link.linkUrl,
        linkText: link.linkText,
        linkType: link.linkType,
        linkDomain: link.linkDomain,
        clicks: link._count.id,
        uniqueUsers: uniqueUsers.length,
      };
    })
  );

  return linksWithUniqueUsers
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit);
}

export async function getLinkClickStats(clientId: string, days: 7 | 30 | 90 = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [totalClicks, byType, topDomains] = await Promise.all([
    db.articleLinkClick.count({
      where: {
        article: { clientId },
        createdAt: { gte: since },
      },
    }),
    db.articleLinkClick.groupBy({
      by: ["linkType"],
      where: {
        article: { clientId },
        createdAt: { gte: since },
      },
      _count: {
        linkType: true,
      },
    }),
    db.articleLinkClick.groupBy({
      by: ["linkDomain"],
      where: {
        article: { clientId },
        createdAt: { gte: since },
        linkDomain: { not: null },
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
    totalClicks,
    byType: byType.map((t) => ({
      type: t.linkType,
      count: t._count.linkType,
    })),
    topDomains: topDomains.map((d) => ({
      domain: d.linkDomain || "unknown",
      clicks: d._count.id,
    })),
  };
}
