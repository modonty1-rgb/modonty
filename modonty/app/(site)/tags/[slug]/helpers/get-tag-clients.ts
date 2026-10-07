import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function getTagClients(slug: string, coreClientId: string | null) {
  "use cache";
  cacheTag("tags");
  cacheTag("clients");
  cacheLife("hours");
  return db.client.findMany({
    where: {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      ...(coreClientId ? { id: { not: coreClientId } } : {}),
      articles: {
        some: {
          status: ArticleStatus.PUBLISHED,
          tags: { some: { tag: { slug } } },
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      phone: true,
      addressCity: true,
      slogan: true,
      _count: { select: { articles: true } },
    },
  });
}
