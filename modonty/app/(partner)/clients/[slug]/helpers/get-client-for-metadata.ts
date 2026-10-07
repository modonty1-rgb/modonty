import { cacheTag, cacheLife } from "next/cache";
import { SubscriptionStatus, ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { clientSlugTag } from "@modonty/shared/lib/cache/client-cache-tags";

// Cached + EXCLUSIVE to metadata (not shared with the dynamic page) so the tags land
// in the prerendered shell <head> instead of being streamed into <body>.
export async function getClientForMetadata(decodedSlug: string) {
  "use cache";
  cacheTag("clients", clientSlugTag(decodedSlug));
  cacheLife("hours");
  return db.client.findUnique({
    where: { slug: decodedSlug, subscriptionStatus: SubscriptionStatus.ACTIVE },
    select: {
      name: true,
      seoTitle: true,
      seoDescription: true,
      description: true,
      nextjsMetadata: true,
      phone: true,
      email: true,
      addressCity: true,
      achievements: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true, width: true, height: true } },
      heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true, width: true, height: true } },
      _count: { select: { articles: { where: { status: ArticleStatus.PUBLISHED } } } },
    },
  });
}

export type ClientForMetadata = NonNullable<Awaited<ReturnType<typeof getClientForMetadata>>>;
