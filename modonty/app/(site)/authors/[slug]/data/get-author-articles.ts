import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

// Moved here unchanged from `authors/[slug]/page.tsx` (7 Oct 2026) so the page and the reader
// mobile API read ONE source.

export const AUTHOR_PAGE_SIZE = 20;

/** One page of the author's articles — `AUTHOR_PAGE_SIZE + 1` rows: the extra one means «more». */
export async function getAuthorArticles(authorId: string, page: number) {
  // Cached for the same reason as the helpers below — the publish-date guard reads the
  // clock, and Next 16 forbids the current time in an uncached prerender scope.
  "use cache";
  cacheTag("authors");
  cacheLife("hours");
  return db.article.findMany({
    where: {
      authorId,
      status: ArticleStatus.PUBLISHED,
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
    },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      datePublished: true,
      featuredImage: {
        select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true },
      },
    },
    orderBy: { datePublished: "desc" },
    skip: (page - 1) * AUTHOR_PAGE_SIZE,
    take: AUTHOR_PAGE_SIZE + 1,
  });
}
