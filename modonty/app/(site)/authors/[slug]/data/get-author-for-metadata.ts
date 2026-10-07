import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

// Cached + EXCLUSIVE to metadata (not shared with the dynamic page) so the tags land
// in the prerendered shell <head> instead of being streamed into <body>.
export async function getAuthorForMetadata(slug: string) {
  "use cache";
  cacheTag("authors");
  cacheLife("hours");
  return db.author.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      seoTitle: true,
      seoDescription: true,
      bio: true,
      image: true,
      nextjsMetadata: true,
    },
  });
}
