import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";

export async function getTagsWithCounts() {
  "use cache";
  cacheTag("tags");
  cacheLife("hours");

  const tags = await db.tag.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      socialImage: true,
      _count: { select: { articles: true } },
    },
    orderBy: { name: "asc" },
  });

  return tags
    .filter(t => t._count.articles > 0)
    .map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      socialImage: t.socialImage || undefined,
      articleCount: t._count.articles,
    }));
}
