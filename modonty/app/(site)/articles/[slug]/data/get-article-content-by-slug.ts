import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * The heavy, same-for-everyone half of an article — identical for every visitor, so it is cached.
 * `cacheLife("hours")` is safe because the admin fires `revalidateTag("articles")` on every
 * publish, update and delete.
 *
 * Deliberately EXCLUDES per-user reactions and the fast-moving aggregate counts; those are read
 * live in `getArticleBySlugMinimal`, so nothing visible goes stale.
 */
export async function getArticleContentBySlug(slug: string) {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");
  return db.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
    },
    include: {
      // The FAQ tally travels with the cached payload so the page never needs a live read for it
      // (1 Sep 2026). It changes only when an FAQ is published, and that fires `revalidateTag`.
      _count: { select: { faqs: true } },
      client: {
        include: {
          logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
          heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true, width: true, height: true } },
          // Client Mini (1.91:1) — preferred over the 6:1 hero for the card image.
          media: {
            where: { type: "CLIENT_MINI" },
            select: { url: true, bunnyUrl: true, blurDataURL: true, width: true, height: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          image: true,
          url: true,
          jobTitle: true,
          linkedIn: true,
          twitter: true,
          facebook: true,
          sameAs: true,
          expertiseAreas: true,
          credentials: true,
        },
      },
      category: { select: { id: true, name: true, slug: true } },
      featuredImage: {
        select: { url: true, bunnyUrl: true, altText: true, width: true, height: true, blurDataURL: true },
      },
      tags: {
        include: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
      gallery: {
        include: {
          media: {
            select: {
              id: true,
              url: true,
              bunnyUrl: true,
              blurDataURL: true,
              altText: true,
              caption: true,
              width: true,
              height: true,
              filename: true,
            },
          },
        },
        orderBy: { position: "asc" as const },
      },
      relatedTo: {
        include: {
          related: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              datePublished: true,
              createdAt: true,
              featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true } },
              client: { select: { name: true, slug: true } },
              likesCount: true,
              dislikesCount: true,
              commentsCount: true,
              _count: { select: { faqs: true } },
            },
          },
        },
      },
    },
  });
}
