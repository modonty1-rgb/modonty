import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

/**
 * The three reads the page body needs — cached, same fix as `/categories/[slug]` and for the
 * same reason the article page was fixed on 1 Sep 2026.
 *
 * They used to sit in a `Promise.all` at the root of `TagPage`: uncached database calls awaited
 * before a single byte could render, outside any `<Suspense>`. The docs shipped with this
 * version (`node_modules/next/dist/docs/01-app/02-guides/building.md:111`) say data accessed
 * outside a boundary «prevents the route from being prerendered, blocking the page load» —
 * the shape that took the article page down.
 *
 * All three are safely cacheable: a tag, the partners publishing under it, and their review
 * averages change on publish or on a new review, and both fire `revalidateTag`.
 */
export async function getTagBySlug(slug: string) {
  "use cache";
  cacheTag("tags");
  cacheLife("hours");
  return db.tag.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      socialImage: true,
      socialImageAlt: true,
      jsonLdStructuredData: true,
    },
  });
}
