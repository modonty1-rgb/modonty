import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

export interface ClientCommentWithDetails {
  id: string;
  content: string;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string | null; email: string | null } | null;
  _count: { replies: number; likes: number; dislikes: number };
}

export interface ClientCommentStats {
  pending: number;
  approved: number;
  rejected: number;
  deleted: number;
  total: number;
}

export async function getPendingClientCommentsCount(
  clientId: string
): Promise<number> {
  return db.clientComment.count({
    where: { clientId, status: CommentStatus.PENDING },
  });
}

export async function getClientCommentStats(
  clientId: string
): Promise<ClientCommentStats> {
  const [pending, approved, rejected, deleted] = await Promise.all([
    db.clientComment.count({ where: { clientId, status: CommentStatus.PENDING } }),
    db.clientComment.count({ where: { clientId, status: CommentStatus.APPROVED } }),
    db.clientComment.count({ where: { clientId, status: CommentStatus.REJECTED } }),
    db.clientComment.count({ where: { clientId, status: CommentStatus.DELETED } }),
  ]);
  return {
    pending,
    approved,
    rejected,
    deleted,
    total: pending + approved + rejected,
  };
}

export async function getClientComments(
  clientId: string
): Promise<ClientCommentWithDetails[]> {
  return db.clientComment.findMany({
    where: { clientId },
    select: {
      id: true,
      content: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true, email: true } },
      _count: { select: { replies: true, likes: true, dislikes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
