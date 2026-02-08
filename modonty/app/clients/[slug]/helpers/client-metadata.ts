import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export async function getClientForMetadata(slug: string) {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");

  return db.client.findUnique({
    where: { slug },
    select: {
      seoTitle: true,
      name: true,
      seoDescription: true,
      logoMedia: { select: { url: true } },
      ogImageMedia: { select: { url: true } },
    },
  });
}
