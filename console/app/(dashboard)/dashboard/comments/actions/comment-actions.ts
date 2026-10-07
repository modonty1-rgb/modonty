"use server";

import { getSessionClientId } from "@/lib/get-session-client-id";
import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { messages } from "@/lib/messages";

import type { CommentKind } from "../helpers/comment-queries";
import { setCommentStatusForClient } from "../helpers/set-comment-status";

/**
 * Moderation for both comment tables (ق10, 2026-08-05).
 *
 * Article comments and reel comments live in different tables but are reviewed on one
 * screen, so every action here takes the `kind` and routes itself. The two share one
 * rule: the cached counter on the parent row tracks APPROVED comments only, so it moves
 * exactly when a comment crosses that line — in either direction.
 */

type Result = { success: true } | { success: false; error: string };
type BulkResult =
  | { success: true; count: number }
  | { success: false; error: string };

async function setStatus(
  kind: CommentKind,
  commentId: string,
  next: CommentStatus
): Promise<Result> {
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  return setCommentStatusForClient(clientId, kind, commentId, next);
}

export async function approveComment(kind: CommentKind, commentId: string): Promise<Result> {
  return setStatus(kind, commentId, CommentStatus.APPROVED);
}

export async function rejectComment(kind: CommentKind, commentId: string): Promise<Result> {
  return setStatus(kind, commentId, CommentStatus.REJECTED);
}

export async function deleteComment(kind: CommentKind, commentId: string): Promise<Result> {
  return setStatus(kind, commentId, CommentStatus.DELETED);
}

/** Restore a REJECTED or DELETED comment back to PENDING for re-review. */
export async function restoreCommentAction(
  kind: CommentKind,
  commentId: string
): Promise<Result> {
  return setStatus(kind, commentId, CommentStatus.PENDING);
}

// ─── Bulk actions ────────────────────────────────────────────────────

/**
 * A selection can hold both kinds at once, so each is addressed as `kind:id` and the
 * batch is split before it touches either table.
 */
export interface BulkRef {
  kind: CommentKind;
  id: string;
}

async function bulkSetStatus(
  refs: BulkRef[],
  next: CommentStatus
): Promise<BulkResult> {
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (refs.length === 0) return { success: true, count: 0 };

  try {
    // One row at a time on purpose: the counter has to move per parent, and `updateMany`
    // cannot tell which comments actually crossed the APPROVED line.
    const outcomes = await Promise.all(
      refs.map((ref) => setStatus(ref.kind, ref.id, next))
    );
    const count = outcomes.filter((o) => o.success).length;

    revalidatePath("/dashboard/comments");
    return { success: true, count };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function bulkApproveComments(refs: BulkRef[]): Promise<BulkResult> {
  return bulkSetStatus(refs, CommentStatus.APPROVED);
}

export async function bulkRejectComments(refs: BulkRef[]): Promise<BulkResult> {
  return bulkSetStatus(refs, CommentStatus.REJECTED);
}
