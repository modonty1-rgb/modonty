"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";

export async function approveComment(commentId: string, clientId: string) {
  try {
    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        article: { clientId },
      },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    await db.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.APPROVED },
    });

    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Approval failed";
    return { success: false, error: message };
  }
}

export async function rejectComment(commentId: string, clientId: string) {
  try {
    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        article: { clientId },
      },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    await db.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.REJECTED },
    });

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
      where: {
        id: commentId,
        article: { clientId },
      },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    await db.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.DELETED },
    });

    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}

export async function bulkApproveComments(
  commentIds: string[],
  clientId: string
) {
  try {
    await db.comment.updateMany({
      where: {
        id: { in: commentIds },
        article: { clientId },
      },
      data: { status: CommentStatus.APPROVED },
    });

    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bulk approval failed";
    return { success: false, error: message };
  }
}

export async function bulkRejectComments(
  commentIds: string[],
  clientId: string
) {
  try {
    await db.comment.updateMany({
      where: {
        id: { in: commentIds },
        article: { clientId },
      },
      data: { status: CommentStatus.REJECTED },
    });

    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bulk rejection failed";
    return { success: false, error: message };
  }
}
