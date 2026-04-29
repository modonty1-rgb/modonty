"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { messages } from "@/lib/messages";

type Result = { success: true } | { success: false; error: string };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

async function ensureOwned(commentId: string, clientId: string) {
  return db.clientComment.findFirst({
    where: { id: commentId, clientId },
    select: { id: true },
  });
}

export async function approveClientComment(commentId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  const owned = await ensureOwned(commentId, clientId);
  if (!owned) return { success: false, error: messages.error.notFound };
  try {
    await db.clientComment.update({
      where: { id: commentId },
      data: { status: CommentStatus.APPROVED },
    });
    revalidatePath("/dashboard/client-comments");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function rejectClientComment(commentId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  const owned = await ensureOwned(commentId, clientId);
  if (!owned) return { success: false, error: messages.error.notFound };
  try {
    await db.clientComment.update({
      where: { id: commentId },
      data: { status: CommentStatus.REJECTED },
    });
    revalidatePath("/dashboard/client-comments");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function deleteClientComment(commentId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  const owned = await ensureOwned(commentId, clientId);
  if (!owned) return { success: false, error: messages.error.notFound };
  try {
    await db.clientComment.update({
      where: { id: commentId },
      data: { status: CommentStatus.DELETED },
    });
    revalidatePath("/dashboard/client-comments");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function restoreClientComment(commentId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  const owned = await ensureOwned(commentId, clientId);
  if (!owned) return { success: false, error: messages.error.notFound };
  try {
    await db.clientComment.update({
      where: { id: commentId },
      data: { status: CommentStatus.PENDING },
    });
    revalidatePath("/dashboard/client-comments");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
