import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

export interface CommentWithDetails {
  id: string;
  content: string;
  status: CommentStatus;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;
  author: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  article: {
    id: string;
    title: string;
    slug: string;
  };
  parent: {
    id: string;
    content: string;
  } | null;
  _count: {
    replies: number;
    likes: number;
    dislikes: number;
  };
}

export interface CommentStats {
  /** Comments visible to admin (excludes DELETED to keep KPIs honest). */
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  /** Soft-deleted — separate so it never inflates the active total. */
  deleted: number;
}

const PAGE_LIMIT = 200;

/**
 * Returns up to {@link PAGE_LIMIT} comments, excluding soft-deleted ones by
 * default (they belong to the trash, not the moderation queue). Pass
 * `includeDeleted` to view them.
 */
export async function getClientComments(
  clientId: string,
  status?: CommentStatus,
  includeDeleted = false
): Promise<CommentWithDetails[]> {
  const where: {
    article: { clientId: string };
    status?: CommentStatus | { not: CommentStatus };
  } = { article: { clientId } };
  if (status) {
    where.status = status;
  } else if (!includeDeleted) {
    where.status = { not: CommentStatus.DELETED };
  }

  const comments = await db.comment.findMany({
    where,
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      article: {
        select: { id: true, title: true, slug: true },
      },
      parent: {
        select: { id: true, content: true },
      },
      _count: {
        select: { replies: true, likes: true, dislikes: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_LIMIT,
  });
  return comments as CommentWithDetails[];
}

/**
 * Returns counts split by status. **`total` excludes DELETED** so the KPI
 * card matches the queue admin actually sees. DELETED are tracked separately.
 */
export async function getCommentStats(
  clientId: string
): Promise<CommentStats> {
  const [pending, approved, rejected, deleted] = await Promise.all([
    db.comment.count({
      where: { article: { clientId }, status: CommentStatus.PENDING },
    }),
    db.comment.count({
      where: { article: { clientId }, status: CommentStatus.APPROVED },
    }),
    db.comment.count({
      where: { article: { clientId }, status: CommentStatus.REJECTED },
    }),
    db.comment.count({
      where: { article: { clientId }, status: CommentStatus.DELETED },
    }),
  ]);

  return {
    total: pending + approved + rejected,
    pending,
    approved,
    rejected,
    deleted,
  };
}

export async function getPendingCommentsCount(
  clientId: string
): Promise<number> {
  return db.comment.count({
    where: {
      article: { clientId },
      status: CommentStatus.PENDING,
    },
  });
}
