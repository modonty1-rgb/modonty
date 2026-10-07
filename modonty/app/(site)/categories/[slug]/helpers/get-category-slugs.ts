import { db } from "@/lib/db";

export async function getCategorySlugs() {
  try {
    const categories = await db.category.findMany({ select: { slug: true } });
    if (!categories || categories.length === 0) return [{ slug: "__no_categories__" }];
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [{ slug: "__no_categories__" }];
  }
}
