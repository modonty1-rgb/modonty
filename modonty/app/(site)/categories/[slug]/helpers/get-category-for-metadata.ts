import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export async function getCategoryForMetadata(slug: string) {
  "use cache";
  cacheTag("categories");
  cacheLife("hours");
  return db.category.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      socialImage: true,
      nextjsMetadata: true,
    },
  });
}
