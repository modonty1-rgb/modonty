import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

/**
 * Where a comment was written. Reel comments moderate on this same page rather than a
 * page of their own (ق10, 2026-08-05): the client reviews everything in one place, and
 * splitting them across two screens is how a comment goes days without a reply.
 */
export type CommentKind = "article" | "reel";

export interface CommentWithDetails {
  id: string;
  kind: CommentKind;
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
  /** The article or the reel the comment hangs off — `href` points at its console page. */
  source: {
    id: string;
    title: string;
    href: string;
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
  const statusFilter = status
    ? status
    : includeDeleted
      ? undefined
      : { not: CommentStatus.DELETED };

  // Two tables, one queue. Fetched in parallel and merged newest-first, so the client
  // works through a single chronological list instead of two half-lists.
  const [articleComments, reelComments] = await Promise.all([
    db.comment.findMany({
      where: { article: { clientId }, ...(statusFilter ? { status: statusFilter } : {}) },
      include: {
        author: { select: { id: true, name: true, email: true } },
        article: { select: { id: true, title: true, slug: true } },
        parent: { select: { id: true, content: true } },
        _count: { select: { replies: true, likes: true, dislikes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_LIMIT,
    }),
    db.mediaComment.findMany({
      where: {
        media: { clientId, inReels: true },
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        media: { select: { id: true, title: true, filename: true } },
        parent: { select: { id: true, content: true } },
        _count: { select: { replies: true, reactions: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_LIMIT,
    }),
  ]);

  const merged: CommentWithDetails[] = [
    ...articleComments.map((co) => ({
      id: co.id,
      kind: "article" as const,
      content: co.content,
      status: co.status,
      isEdited: co.isEdited,
      createdAt: co.createdAt,
      updatedAt: co.updatedAt,
      editedAt: co.editedAt,
      author: co.author,
      source: {
        id: co.article.id,
        title: co.article.title,
        href: `/dashboard/articles/${co.article.id}`,
      },
      parent: co.parent,
      _count: co._count,
    })),
    ...reelComments.map((co) => ({
      id: co.id,
      kind: "reel" as const,
      content: co.content,
      status: co.status,
      isEdited: co.isEdited,
      createdAt: co.createdAt,
      updatedAt: co.updatedAt,
      editedAt: co.editedAt,
      author: co.author,
      source: {
        id: co.media.id,
        title: co.media.title || co.media.filename,
        href: "/dashboard/reels",
      },
      parent: co.parent,
      // A reel comment carries reactions, not a like/dislike pair — they are counted
      // together here rather than invented apart.
      _count: { replies: co._count.replies, likes: co._count.reactions, dislikes: 0 },
    })),
  ];

  merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return merged.slice(0, PAGE_LIMIT);
}

/**
 * Returns counts split by status. **`total` excludes DELETED** so the KPI
 * card matches the queue admin actually sees. DELETED are tracked separately.
 */
/** Both tables, one number per status — the KPI cards sit above one merged queue. */
async function countBoth(clientId: string, status: CommentStatus): Promise<number> {
  const [articles, reels] = await Promise.all([
    db.comment.count({ where: { article: { clientId }, status } }),
    db.mediaComment.count({ where: { media: { clientId, inReels: true }, status } }),
  ]);
  return articles + reels;
}

export async function getCommentStats(
  clientId: string
): Promise<CommentStats> {
  const [pending, approved, rejected, deleted] = await Promise.all([
    countBoth(clientId, CommentStatus.PENDING),
    countBoth(clientId, CommentStatus.APPROVED),
    countBoth(clientId, CommentStatus.REJECTED),
    countBoth(clientId, CommentStatus.DELETED),
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
  return countBoth(clientId, CommentStatus.PENDING);
}
