import { CommentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { flattenCommentsWithContext } from "@/lib/comments/flatten-comments-with-context";

export interface ReelComment {
  id: string;
  content: string;
  createdAt: Date;
  parentId: string | null;
  replyingTo: { id: string; authorName: string } | null;
  author: { id: string; name: string | null; image: string | null } | null;
  likesCount: number;
  likedByMe: boolean;
}

/**
 * Approved comments for one reel, replies resolved, oldest first — the same contract as
 * article comments (dev shows the moderation pipeline, production shows APPROVED only).
 * Per-user like state is folded in here because the sheet is the single reader and always
 * loads lazily after the feed paints — nothing cached depends on this query.
 */
export async function getReelComments(mediaId: string, userId: string | null): Promise<ReelComment[]> {
  const isDev = process.env.NODE_ENV === "development";

  const comments = await db.mediaComment.findMany({
    where: {
      mediaId,
      ...(isDev
        ? { status: { not: CommentStatus.DELETED } }
        : { status: CommentStatus.APPROVED }),
    },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true,
      content: true,
      createdAt: true,
      parentId: true,
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { reactions: { where: { isLike: true } } } },
    },
  });

  let likedIds = new Set<string>();
  if (userId && comments.length > 0) {
    const mine = await db.commentReaction.findMany({
      where: { userId, isLike: true, commentId: { in: comments.map((c) => c.id) } },
      select: { commentId: true },
    });
    likedIds = new Set(mine.map((r) => r.commentId));
  }

  return flattenCommentsWithContext(comments).map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    parentId: c.parentId,
    replyingTo: c.replyingTo,
    author: c.author,
    likesCount: c._count.reactions,
    likedByMe: likedIds.has(c.id),
  }));
}
