import { db } from "@/lib/db";

import type { CommentKind } from "./comment-kind";

/**
 * Tell the reader when the partner lets their comment through — and, for a reply, tell the
 * person being replied to. Before this nothing reached the reader's inbox at all: they wrote,
 * waited, and never learned it went live (subscriber QA finding #11, 29 Sep 2026).
 *
 * `relatedId` is the comment's id; modonty's notifications page reads the comment back by the
 * type (`comment_*` → Comment, `reel_comment_*` → MediaComment). Never throws: a failed notice
 * must not undo an approval the partner already made.
 */
export async function notifyCommentApproved(kind: CommentKind, commentId: string): Promise<void> {
  try {
    // Approve → restore → approve again must not notify twice.
    if (await db.notification.findFirst({ where: { relatedId: commentId }, select: { id: true } })) return;

    const row =
      kind === "article"
        ? await db.comment.findUnique({
            where: { id: commentId },
            select: {
              authorId: true,
              article: { select: { title: true, clientId: true } },
              parent: { select: { authorId: true } },
            },
          })
        : await db.mediaComment.findUnique({
            where: { id: commentId },
            select: {
              authorId: true,
              media: { select: { title: true, clientId: true } },
              parent: { select: { authorId: true } },
            },
          });
    if (!row) return;

    const where =
      "article" in row ? row.article.title : row.media.title ? `«${row.media.title}»` : "الريل";
    const clientId = "article" in row ? row.article.clientId : row.media.clientId;
    const prefix = kind === "article" ? "comment" : "reel_comment";
    const notices = [];

    if (row.authorId) {
      notices.push({
        userId: row.authorId,
        clientId,
        type: `${prefix}_approved`,
        title: "تعليقك صار ظاهراً",
        body: `وافق الشريك على تعليقك في: ${where}`,
        relatedId: commentId,
      });
    }
    const parentAuthor = row.parent?.authorId;
    if (parentAuthor && parentAuthor !== row.authorId) {
      notices.push({
        userId: parentAuthor,
        clientId,
        type: `${prefix}_reply`,
        title: "ردّ أحد على تعليقك",
        body: `وصلك ردّ على تعليقك في: ${where}`,
        relatedId: commentId,
      });
    }
    if (notices.length) await db.notification.createMany({ data: notices });
  } catch (error) {
    console.error("[notifyCommentApproved]", error);
  }
}
