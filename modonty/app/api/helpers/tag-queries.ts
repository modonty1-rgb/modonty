import { db } from "@/lib/db";
import { cacheTag, cacheLife } from "next/cache";

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
