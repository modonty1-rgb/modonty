import { db } from "@/lib/db";
import { LinkType } from "@prisma/client";

interface LinkClickData {
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
