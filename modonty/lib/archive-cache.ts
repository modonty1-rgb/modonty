import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

/**
 * Cached set of archived article slugs for fast proxy lookup.
 * Revalidates every 5 minutes; mutations on archive should call
 * `revalidateTag("archived-slugs")` for immediate freshness.
 */
const getArchivedSlugSet = unstable_cache(
  async (): Promise<string[]> => {
    const archived = await db.article.findMany({
      where: { status: "ARCHIVED" },
      select: { slug: true },
    });
    return archived.map((a) => a.slug);
  },
  ["modonty:archived-slugs"],
  { revalidate: 300, tags: ["archived-slugs"] },
);

export async function isArchivedSlug(slug: string): Promise<boolean> {
  try {
    const slugs = await getArchivedSlugSet();
    return slugs.includes(slug);
  } catch {
    return false;
  }
}
