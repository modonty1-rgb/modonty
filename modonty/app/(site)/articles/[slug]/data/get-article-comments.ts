import { ArticleStatus, CommentStatus } from "@prisma/client";

import { db } from "@/lib/db";

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  status: true,
  parentId: true,
  author: { select: { id: true, name: true, image: true } },
  _count: { select: { likes: true, dislikes: true } },
} as const;

type CommentRow = { id: string; parentId: string | null; createdAt: Date; author: { name: string | null } | null };

/**
 * Replies are stored flat with a `parentId`, so each one is given back the name it answers —
 * without it a reply reads as a new comment. A reply whose parent was deleted is marked orphaned
 * rather than dropped.
 */
function flattenCommentsWithContext<T extends CommentRow>(comments: T[]) {
  const byId = new Map(comments.map((c) => [c.id, c]));

  return comments
    .map((comment) => {
      if (!comment.parentId) return { ...comment, replyingTo: null };
      const parent = byId.get(comment.parentId);
      return {
        ...comment,
        replyingTo: parent ? { id: parent.id, authorName: parent.author?.name || "ضيف" } : null,
        isOrphaned: !parent,
      };
    })
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

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
