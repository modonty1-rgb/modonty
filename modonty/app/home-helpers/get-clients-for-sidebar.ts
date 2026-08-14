import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus, ClientCtaMode, SubscriptionStatus } from "@prisma/client";
import type { ClientResponse } from "@/lib/types";

/** شكل بطاقة الشريك في الشريط الجانبي — لا يقرأه غير هذا الملف. */
export interface SidebarClient {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  industry?: string;
  articleCount: number;
}

export async function getClientsForSidebar(limit = 20): Promise<SidebarClient[]> {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");

  const clients = await db.client.findMany({
    where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      slug: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      industry:  { select: { name: true } },
      // Published, non-future article count — matches the feed filter exactly so the
      // badge number == what the filtered feed shows.
      _count: {
        select: {
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
              OR: [
                { datePublished: null },
                { datePublished: { lte: new Date() } },
              ],
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return clients.map(c => ({
    id:       c.id,
    name:     c.name,
    slug:     c.slug,
    logo:     mediaSrc(c.logoMedia) || undefined,
    industry: c.industry?.name || undefined,
    articleCount: c._count?.articles ?? 0,
  }));
}
