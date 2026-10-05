import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { messages } from "@/lib/messages";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

import type { CommentKind } from "./comment-queries";
import { notifyCommentApproved } from "./notify-comment-approved";

/**
 * تغيير حالة تعليق (مقال أو ريل) لعميلٍ بعينه — المنطق الواحد للويب وتطبيق الجوال.
 *
 * كان داخل أكشن الويب ويقرأ العميل من جلسة المتصفّح، فلم يستطع التطبيق (جلسة Bearer)
 * أن يعتمد تعليقاً — والعميل صار يصله جرس «تعليق جديد» بلا زرّ يفعل به شيئاً (٥ أكتوبر ٢٠٢٦).
 */
export type CommentStatusResult = { success: true } | { success: false; error: string };

interface OwnedComment {
  status: CommentStatus;
  /** Article id or media id — whichever row carries the cached counter. */
  parentId: string;
}

async function findOwned(
  kind: CommentKind,
  commentId: string,
  clientId: string
): Promise<OwnedComment | null> {
  if (kind === "article") {
    const row = await db.comment.findFirst({
      where: { id: commentId, article: { clientId } },
      select: { status: true, articleId: true },
    });
    return row ? { status: row.status, parentId: row.articleId } : null;
  }

  const row = await db.mediaComment.findFirst({
    where: { id: commentId, media: { clientId, inReels: true } },
    select: { status: true, mediaId: true },
  });
  return row ? { status: row.status, parentId: row.mediaId } : null;
}

/** Move the parent's cached counter by `delta`, on whichever table owns the comment. */
async function bumpCounter(kind: CommentKind, parentId: string, delta: number) {
  const data = { commentsCount: delta > 0 ? { increment: delta } : { decrement: -delta } };
  if (kind === "article") {
    await db.article.update({ where: { id: parentId }, data, select: { id: true } });
  } else {
    await db.media.update({ where: { id: parentId }, data, select: { id: true } });
  }
}

export async function setCommentStatusForClient(
  clientId: string,
  kind: CommentKind,
  commentId: string,
  next: CommentStatus
): Promise<CommentStatusResult> {
  try {
    const owned = await findOwned(kind, commentId, clientId);
    if (!owned) return { success: false, error: messages.error.notFound };

    if (kind === "article") {
      await db.comment.update({ where: { id: commentId }, data: { status: next } });
    } else {
      await db.mediaComment.update({ where: { id: commentId }, data: { status: next } });
    }

    const wasApproved = owned.status === CommentStatus.APPROVED;
    const isApproved = next === CommentStatus.APPROVED;
    if (wasApproved !== isApproved) {
      await bumpCounter(kind, owned.parentId, isApproved ? 1 : -1);
      // A reel's comment count is read from modonty's "reels" cache (feed + watch page), and
      // only this console action moves it — so it has to bust that cache, or modonty shows the
      // old count until the cache ages out (plan / Vercel cost, 2 Oct 2026: reels moved from
      // a one-minute cache life to hours). Best-effort: moderation must not fail on it.
      if (kind === "reel") await revalidateModontyTag("reels").catch(() => {});
    }
    if (isApproved && !wasApproved) await notifyCommentApproved(kind, commentId);

    revalidatePath("/dashboard/comments");
    if (kind === "reel") revalidatePath("/dashboard/reels");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

