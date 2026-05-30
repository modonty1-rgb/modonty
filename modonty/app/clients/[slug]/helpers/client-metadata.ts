import { cacheTag, cacheLife } from "next/cache";
import { SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function getClientForMetadata(slug: string) {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");

  return db.client.findUnique({
    // Only ACTIVE clients are public — non-active resolve to "not found" metadata.
    where: { slug, subscriptionStatus: SubscriptionStatus.ACTIVE },
    select: {
      seoTitle: true,
      name: true,
      seoDescription: true,
      logoMedia: { select: { url: true } },
      heroImageMedia: { select: { url: true } },
    },
  });
}
