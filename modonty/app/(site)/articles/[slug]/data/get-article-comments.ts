import { ArticleStatus, CommentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { flattenCommentsWithContext } from "@/lib/comments/flatten-comments-with-context";

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  status: true,
  parentId: true,
  author: { select: { id: true, name: true, image: true } },
  _count: { select: { likes: true, dislikes: true } },
} as const;

/** Approved comments for an article, ordered oldest first. Loaded after the page paints. */
export async function getArticleComments(articleId: string) {
  const isDev = process.env.NODE_ENV === "development";
  const article = await db.article.findFirst({
    where: { id: articleId, status: ArticleStatus.PUBLISHED },
    select: {
      comments: {
        where: isDev ? {} : { status: CommentStatus.APPROVED },
        orderBy: { createdAt: "asc" as const },
        select: commentSelect,
      },
    },
  });
  if (!article) return null;
  return flattenCommentsWithContext(article.comments ?? []);
}
