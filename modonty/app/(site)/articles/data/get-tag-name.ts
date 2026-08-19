import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";

/**
 * One tag's display name, for the heading and the title when a visitor arrives from
 * `/tags/[slug]` → `/articles?tag=…`.
 *
 * A single lookup instead of carrying the whole tag list through the page: the rail stopped
 * offering tags (Khalid, 2026-08-19), so the only thing still needed is the name of the one tag
 * actually being filtered by.
 */
export async function getTagName(slug: string): Promise<string | null> {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");

  const tag = await db.tag.findUnique({ where: { slug }, select: { name: true } });
  return tag?.name ?? null;
}
