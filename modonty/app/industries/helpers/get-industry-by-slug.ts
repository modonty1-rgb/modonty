import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { IndustryListItem, IndustryQueryOptions } from "@/lib/types";

export async function getIndustryBySlug(slug: string) {
  return db.industry.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      socialImage: true,
      socialImageAlt: true,
      jsonLdStructuredData: true,
      nextjsMetadata: true,
      clients: {
        where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
          heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
          phone: true,
          addressCity: true,
          description: true,
          slogan: true,
          _count: { select: { articles: true } },
        },
      },
    },
  });
}
