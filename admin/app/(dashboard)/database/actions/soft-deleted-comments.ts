"use server";

import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

// Industry-standard 30-day restore window (Disqus/WordPress/Facebook/Twitter).
// After this, status=DELETED rows on Comment + ClientComment are hard-deleted.
const RESTORE_WINDOW_DAYS = 30;

export interface SoftDeletedCommentsStats {
  articleComments: number;
  clientComments: number;
  total: number;
  cutoffDate: string;
}

export async function getSoftDeletedCommentsStats(): Promise<SoftDeletedCommentsStats> {
  const cutoff = new Date(Date.now() - RESTORE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const [articleComments, clientComments] = await Promise.all([
    db.comment.count({
      where: { status: CommentStatus.DELETED, updatedAt: { lt: cutoff } },
    }),
    db.clientComment.count({
      where: { status: CommentStatus.DELETED, updatedAt: { lt: cutoff } },
    }),
  ]);
  return {
    articleComments,
    clientComments,
    total: articleComments + clientComments,
    cutoffDate: cutoff.toISOString(),
  };
}

export async function hardDeleteOldSoftDeletedComments(): Promise<{
  deleted: number;
  articleComments: number;
  clientComments: number;
}> {
  const cutoff = new Date(Date.now() - RESTORE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const [articleResult, clientResult] = await Promise.all([
    db.comment.deleteMany({
      where: { status: CommentStatus.DELETED, updatedAt: { lt: cutoff } },
    }),
    db.clientComment.deleteMany({
      where: { status: CommentStatus.DELETED, updatedAt: { lt: cutoff } },
    }),
  ]);
  return {
    articleComments: articleResult.count,
    clientComments: clientResult.count,
    deleted: articleResult.count + clientResult.count,
  };
}
