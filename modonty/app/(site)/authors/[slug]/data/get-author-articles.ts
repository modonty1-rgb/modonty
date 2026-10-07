import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { AUTHOR_PAGE_SIZE } from "../helpers/author-page-size";

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
