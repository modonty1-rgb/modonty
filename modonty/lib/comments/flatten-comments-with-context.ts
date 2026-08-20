interface CommentRow {
  id: string;
  parentId: string | null;
  createdAt: Date;
  author: { name: string | null } | null;
}

/**
 * Replies are stored flat with a `parentId`, so each one is given back the name it answers —
 * without it a reply reads as a new comment. A reply whose parent was deleted is marked orphaned
 * rather than dropped. Shared by article comments and reel comments — same table shape.
 */
export function flattenCommentsWithContext<T extends CommentRow>(comments: T[]) {
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
