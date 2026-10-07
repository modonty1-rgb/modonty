import { db } from "@/lib/db";

export async function getAuthorSlugs() {
  try {
    const authors = await db.author.findMany({ select: { slug: true } });
    if (!authors || authors.length === 0) {
      // Cache Components needs at least one param at build time.
      return [{ slug: "__no_authors__" }];
    }
    return authors.map((a) => ({ slug: a.slug }));
  } catch {
    return [{ slug: "__no_authors__" }];
  }
}
