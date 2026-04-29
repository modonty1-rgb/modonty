"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { messages } from "@/lib/messages";

type Result = { success: true } | { success: false; error: string };
type BulkResult =
  | { success: true; count: number }
  | { success: false; error: string };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

async function ensureOwnedComment(commentId: string, clientId: string) {
  return db.comment.findFirst({
    where: { id: commentId, article: { clientId } },
    select: { id: true, status: true, articleId: true },
  });
}

export async function approveComment(commentId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await ensureOwnedComment(commentId, clientId);
    if (!owned) return { success: false, error: messages.error.notFound };

    const wasNotApproved = owned.status !== CommentStatus.APPROVED;
    await db.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.APPROVED },
    });

    if (wasNotApproved) {
      await db.article.update({
        where: { id: owned.articleId },
        data: { commentsCount: { increment: 1 } },
        select: { id: true },
      });
    }
    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function rejectComment(commentId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await ensureOwnedComment(commentId, clientId);
    if (!owned) return { success: false, error: messages.error.notFound };

    const wasApproved = owned.status === CommentStatus.APPROVED;
    await db.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.REJECTED },
    });

    if (wasApproved) {
      await db.article.update({
        where: { id: owned.articleId },
        data: { commentsCount: { decrement: 1 } },
        select: { id: true },
      });
    }
    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function deleteComment(commentId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await ensureOwnedComment(commentId, clientId);
    if (!owned) return { success: false, error: messages.error.notFound };

    const wasApproved = owned.status === CommentStatus.APPROVED;
    await db.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.DELETED },
    });

    if (wasApproved) {
      await db.article.update({
        where: { id: owned.articleId },
        data: { commentsCount: { decrement: 1 } },
        select: { id: true },
      });
    }
    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

/** Restore a REJECTED or DELETED comment back to PENDING for re-review. */
export async function restoreCommentAction(commentId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await ensureOwnedComment(commentId, clientId);
    if (!owned) return { success: false, error: messages.error.notFound };

    await db.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.PENDING },
    });
    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

// ─── Bulk actions ────────────────────────────────────────────────────

export async function bulkApproveComments(ids: string[]): Promise<BulkResult> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (ids.length === 0) return { success: true, count: 0 };

  try {
    const toApprove = await db.comment.findMany({
      where: {
        id: { in: ids },
        article: { clientId },
        status: { not: CommentStatus.APPROVED },
      },
      select: { articleId: true },
    });

    const result = await db.comment.updateMany({
      where: { id: { in: ids }, article: { clientId } },
      data: { status: CommentStatus.APPROVED },
    });

    const countsByArticle = toApprove.reduce<Record<string, number>>((acc, c) => {
      acc[c.articleId] = (acc[c.articleId] ?? 0) + 1;
      return acc;
    }, {});

    await Promise.all(
      Object.entries(countsByArticle).map(([articleId, count]) =>
        db.article.update({
          where: { id: articleId },
          data: { commentsCount: { increment: count } },
          select: { id: true },
        })
      )
    );

    revalidatePath("/dashboard/comments");
    return { success: true, count: result.count };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function bulkRejectComments(ids: string[]): Promise<BulkResult> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (ids.length === 0) return { success: true, count: 0 };

  try {
    const toReject = await db.comment.findMany({
      where: {
        id: { in: ids },
        article: { clientId },
        status: CommentStatus.APPROVED,
      },
      select: { articleId: true },
    });

    const result = await db.comment.updateMany({
      where: { id: { in: ids }, article: { clientId } },
      data: { status: CommentStatus.REJECTED },
    });

    const countsByArticle = toReject.reduce<Record<string, number>>((acc, c) => {
      acc[c.articleId] = (acc[c.articleId] ?? 0) + 1;
      return acc;
    }, {});

    await Promise.all(
      Object.entries(countsByArticle).map(([articleId, count]) =>
        db.article.update({
          where: { id: articleId },
          data: { commentsCount: { decrement: count } },
          select: { id: true },
        })
      )
    );

    revalidatePath("/dashboard/comments");
    return { success: true, count: result.count };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
