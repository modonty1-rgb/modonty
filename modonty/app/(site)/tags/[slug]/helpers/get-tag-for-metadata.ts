import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export async function getTagForMetadata(slug: string) {
  "use cache";
  cacheTag("tags");
  cacheLife("hours");
  return db.tag.findUnique({
    where: { slug },
    select: {
      name: true,
      seoTitle: true,
      seoDescription: true,
      socialImage: true,
      nextjsMetadata: true,
    },
  });
}
