import { db } from "@/lib/db";

export async function getTagSlugs() {
  try {
    const tags = await db.tag.findMany({ select: { slug: true } });
    if (!tags || tags.length === 0) return [{ slug: "__no_tags__" }];
    return tags.map((t) => ({ slug: t.slug }));
  } catch {
    return [{ slug: "__no_tags__" }];
  }
}
