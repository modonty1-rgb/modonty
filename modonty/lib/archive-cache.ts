import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

/**
 * Cached set of PUBLISHED article slugs for fast proxy lookup.
 * Anything NOT in this set (archived, draft, scheduled, deleted) should return 410.
 * Revalidates every 5 minutes; publish/unpublish mutations should call
 * `revalidateTag("published-slugs")` for immediate freshness.
 */
const getPublishedSlugSet = unstable_cache(
  async (): Promise<string[]> => {
    const published = await db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return published.map((a) => a.slug);
  },
  ["modonty:published-slugs"],
  { revalidate: 300, tags: ["published-slugs"] },
);

/** True when the slug is a currently-published article (the only state that should serve a 200). */
export async function isPublishedSlug(slug: string): Promise<boolean> {
  try {
    const slugs = await getPublishedSlugSet();
    return slugs.includes(slug);
  } catch {
    // On cache failure, default to "published" so we don't accidentally 410 a live page.
    return true;
  }
}
