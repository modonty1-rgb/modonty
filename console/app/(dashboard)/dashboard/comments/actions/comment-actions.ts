"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { messages } from "@/lib/messages";
import { db } from "@/lib/db";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

import type { CommentKind } from "../helpers/comment-queries";
import { setCommentStatusForClient } from "../helpers/set-comment-status";
import { notifyCommentApproved } from "../helpers/notify-comment-approved";

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

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

async function setStatus(
  kind: CommentKind,
  commentId: string,
  next: CommentStatus
): Promise<Result> {
  const clientId = await getClientId();
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

/** Sum `delta` per parent id, in memory — so a batch touching the same article/reel
 *  twice moves its counter ONCE, not twice racing each other. */
function sumDeltas(rows: { status: CommentStatus; parentId: string }[], next: CommentStatus) {
  const isApproved = next === CommentStatus.APPROVED;
  const deltas = new Map<string, number>();
  for (const r of rows) {
    const wasApproved = r.status === CommentStatus.APPROVED;
    if (wasApproved !== isApproved) {
      deltas.set(r.parentId, (deltas.get(r.parentId) ?? 0) + (isApproved ? 1 : -1));
    }
  }
  return deltas;
}

async function bumpCounters(kind: CommentKind, deltas: Map<string, number>) {
  await Promise.all(
    Array.from(deltas.entries()).map(([id, delta]) => {
      const data = { commentsCount: delta > 0 ? { increment: delta } : { decrement: -delta } };
      return kind === "article"
        ? db.article.update({ where: { id }, data, select: { id: true } })
        : db.media.update({ where: { id }, data, select: { id: true } });
    })
  );
}

async function bulkSetStatus(
  refs: BulkRef[],
  next: CommentStatus
): Promise<BulkResult> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (refs.length === 0) return { success: true, count: 0 };

  try {
    // Batched, not one round-trip per comment (N+1 found 15 Oct 2026 — the per-ref
    // `setStatus` loop was also a real-lost-update risk: two comments on the SAME
    // article in one batch raced two separate `increment`s instead of summing first).
    const articleIds = refs.filter((r) => r.kind === "article").map((r) => r.id);
    const reelIds = refs.filter((r) => r.kind === "reel").map((r) => r.id);

    const [articleRows, reelRows] = await Promise.all([
      articleIds.length
        ? db.comment.findMany({
            where: { id: { in: articleIds }, article: { clientId } },
            select: { id: true, status: true, articleId: true },
          })
        : [],
      reelIds.length
        ? db.mediaComment.findMany({
            where: { id: { in: reelIds }, media: { clientId, inReels: true } },
            select: { id: true, status: true, mediaId: true },
          })
        : [],
    ]);

    const articleDeltas = sumDeltas(
      articleRows.map((r) => ({ status: r.status, parentId: r.articleId })),
      next
    );
    const reelDeltas = sumDeltas(
      reelRows.map((r) => ({ status: r.status, parentId: r.mediaId })),
      next
    );
    const newlyApprovedArticleIds = articleRows
      .filter((r) => r.status !== CommentStatus.APPROVED && next === CommentStatus.APPROVED)
      .map((r) => r.id);
    const newlyApprovedReelIds = reelRows
      .filter((r) => r.status !== CommentStatus.APPROVED && next === CommentStatus.APPROVED)
      .map((r) => r.id);

    await Promise.all([
      articleRows.length
        ? db.comment.updateMany({ where: { id: { in: articleRows.map((r) => r.id) } }, data: { status: next } })
        : null,
      reelRows.length
        ? db.mediaComment.updateMany({ where: { id: { in: reelRows.map((r) => r.id) } }, data: { status: next } })
        : null,
    ]);

    await Promise.all([bumpCounters("article", articleDeltas), bumpCounters("reel", reelDeltas)]);

    if (reelDeltas.size > 0) await revalidateModontyTag("reels").catch(() => {});
    for (const id of newlyApprovedArticleIds) await notifyCommentApproved("article", id);
    for (const id of newlyApprovedReelIds) await notifyCommentApproved("reel", id);

    const count = articleRows.length + reelRows.length;
    revalidatePath("/dashboard/comments");
    if (reelRows.length) revalidatePath("/dashboard/reels");
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
