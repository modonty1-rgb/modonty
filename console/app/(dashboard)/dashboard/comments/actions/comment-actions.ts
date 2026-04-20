"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { messages } from "@/lib/messages";

export async function approveComment(commentId: string, clientId: string) {
  try {
    const comment = await db.comment.findFirst({
      where: { id: commentId, article: { clientId } },
      select: { id: true, status: true, articleId: true },
    });

    if (!comment) {
      return { success: false, error: messages.error.notFound };
    }

    const wasNotApproved = comment.status !== CommentStatus.APPROVED;

    await db.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.APPROVED },
    });

    if (wasNotApproved) {
      await db.article.update({
        where: { id: comment.articleId },
        data: { commentsCount: { increment: 1 } },
        select: { id: true },
      });
    }

    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch (error) {
    return { success: false, error: messages.error.serverError };
  }
}

export async function rejectComment(commentId: string, clientId: string) {
  try {
    const comment = await db.comment.findFirst({
      where: { id: commentId, article: { clientId } },
      select: { id: true, status: true, articleId: true },
    });

    if (!comment) {
      return { success: false, error: messages.error.notFound };
    }

    const wasApproved = comment.status === CommentStatus.APPROVED;

    await db.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.REJECTED },
    });

    if (wasApproved) {
      await db.article.update({
        where: { id: comment.articleId },
        data: { commentsCount: { decrement: 1 } },
        select: { id: true },
      });
    }

    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rejection failed";
    return { success: false, error: message };
  }
}

export async function deleteComment(commentId: string, clientId: string) {
  try {
    const comment = await db.comment.findFirst({
      where: { id: commentId, article: { clientId } },
      select: { id: true, status: true, articleId: true },
    });

    if (!comment) {
      return { success: false, error: messages.error.notFound };
    }

    const wasApproved = comment.status === CommentStatus.APPROVED;

    await db.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.DELETED },
    });

    if (wasApproved) {
      await db.article.update({
        where: { id: comment.articleId },
        data: { commentsCount: { decrement: 1 } },
        select: { id: true },
      });
    }

    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}

export async function bulkApproveComments(commentIds: string[], clientId: string) {
  try {
    // Find comments not yet approved — these will gain APPROVED status
    const toApprove = await db.comment.findMany({
      where: { id: { in: commentIds }, article: { clientId }, status: { not: CommentStatus.APPROVED } },
      select: { articleId: true },
    });

    await db.comment.updateMany({
      where: { id: { in: commentIds }, article: { clientId } },
      data: { status: CommentStatus.APPROVED },
    });

    // Group by articleId and increment per-article commentsCount
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
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bulk approval failed";
    return { success: false, error: message };
  }
}

export async function bulkRejectComments(commentIds: string[], clientId: string) {
  try {
    // Find comments that are currently approved — these will lose APPROVED status
    const toReject = await db.comment.findMany({
      where: { id: { in: commentIds }, article: { clientId }, status: CommentStatus.APPROVED },
      select: { articleId: true },
    });

    await db.comment.updateMany({
      where: { id: { in: commentIds }, article: { clientId } },
      data: { status: CommentStatus.REJECTED },
    });

    // Group by articleId and decrement per-article commentsCount
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
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bulk rejection failed";
    return { success: false, error: message };
  }
}
