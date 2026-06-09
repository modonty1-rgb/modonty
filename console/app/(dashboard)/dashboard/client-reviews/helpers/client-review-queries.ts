import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

export interface ClientReviewWithDetails {
  id: string;
  rating: number;
  comment: string;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string | null; email: string | null } | null;
}

export interface ClientReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  deleted: number;
  total: number;
  /** Average of APPROVED ratings (0 when none). */
  averageRating: number;
}

export async function getPendingClientReviewsCount(
  clientId: string
): Promise<number> {
  return db.clientReview.count({
    where: { clientId, status: CommentStatus.PENDING },
  });
}

export async function getClientReviewStats(
  clientId: string
): Promise<ClientReviewStats> {
  const [pending, approved, rejected, deleted, agg] = await Promise.all([
    db.clientReview.count({ where: { clientId, status: CommentStatus.PENDING } }),
    db.clientReview.count({ where: { clientId, status: CommentStatus.APPROVED } }),
    db.clientReview.count({ where: { clientId, status: CommentStatus.REJECTED } }),
    db.clientReview.count({ where: { clientId, status: CommentStatus.DELETED } }),
    db.clientReview.aggregate({
      where: { clientId, status: CommentStatus.APPROVED },
      _avg: { rating: true },
    }),
  ]);
  return {
    pending,
    approved,
    rejected,
    deleted,
    total: pending + approved + rejected,
    averageRating: agg._avg.rating ?? 0,
  };
}

export async function getClientReviews(
  clientId: string
): Promise<ClientReviewWithDetails[]> {
  return db.clientReview.findMany({
    where: { clientId },
    select: {
      id: true,
      rating: true,
      comment: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
