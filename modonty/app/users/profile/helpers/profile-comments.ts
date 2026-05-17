import { db } from "@/lib/db";
import type { CommentStatus } from "@prisma/client";

/** Excludes DELETED — the helper filters those out before returning. */
export type VisibleCommentStatus = Exclude<CommentStatus, "DELETED">;

export interface UserComment {
  id: string;
  content: string;
  createdAt: Date;
  status: VisibleCommentStatus;
  article: {
    id: string;
    title: string;
    slug: string;
    client: { name: string; slug: string };
  };
  likesCount: number;
  dislikesCount: number;
  repliesCount: number;
}

export interface CommentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProfileComments {
  comments: UserComment[];
  pagination: CommentsPagination;
}

/**
 * Server-side counterpart of GET /api/users/[id]/comments. Excludes DELETED.
 * Per-request (not cached) — profile is `noindex` and comment counts mutate.
 */
export async function getProfileComments(
  userId: string,
  page = 1,
  limit = 10,
): Promise<ProfileComments> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(limit, 50));
  const skip = (safePage - 1) * safeLimit;

  const where = {
    authorId: userId,
    status: { not: "DELETED" as CommentStatus },
  };

  const [rawComments, total] = await Promise.all([
    db.comment.findMany({
      where,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            client: { select: { name: true, slug: true } },
          },
        },
        _count: { select: { likes: true, dislikes: true, replies: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
    }),
    db.comment.count({ where }),
  ]);

  const comments: UserComment[] = rawComments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    // Safe cast — `where` clause excludes DELETED so c.status is one of the visible variants.
    status: c.status as VisibleCommentStatus,
    article: {
      id: c.article.id,
      title: c.article.title,
      slug: c.article.slug,
      client: c.article.client,
    },
    likesCount: c._count.likes,
    dislikesCount: c._count.dislikes,
    repliesCount: c._count.replies,
  }));

  return {
    comments,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}
