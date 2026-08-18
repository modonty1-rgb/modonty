import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

/** More from the same author — «اقرأ له أيضاً» under the article. */
export async function getRelatedArticlesByAuthor(authorId: string, currentArticleId: string) {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");
  const articles = await db.article.findMany({
    where: {
      authorId,
      id: { not: currentArticleId },
      status: ArticleStatus.PUBLISHED,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      datePublished: true,
      createdAt: true,
      featuredImage: {
        select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true },
      },
      client: { select: { name: true, slug: true } },
      _count: { select: { likes: true, dislikes: true, comments: true, faqs: true } },
    },
    orderBy: { datePublished: "desc" },
    take: 6,
  });

  return articles.map(({ _count, ...a }) => ({
    ...a,
    likesCount: _count.likes,
    dislikesCount: _count.dislikes,
    commentsCount: _count.comments,
    questionsCount: _count.faqs,
  }));
}
