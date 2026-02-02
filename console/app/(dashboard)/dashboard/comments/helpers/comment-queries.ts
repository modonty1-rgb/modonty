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

export async function getClientComments(
  clientId: string,
  status?: CommentStatus
): Promise<CommentWithDetails[]> {
  const comments = await db.comment.findMany({
    where: {
      article: { clientId },
      ...(status && { status }),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      parent: {
        select: {
          id: true,
          content: true,
        },
      },
      _count: {
        select: {
          replies: true,
          likes: true,
          dislikes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return comments as CommentWithDetails[];
}

export async function getCommentStats(clientId: string) {
  const [total, pending, approved, rejected] = await Promise.all([
    db.comment.count({
      where: { article: { clientId } },
    }),
    db.comment.count({
      where: { article: { clientId }, status: CommentStatus.PENDING },
    }),
    db.comment.count({
      where: { article: { clientId }, status: CommentStatus.APPROVED },
    }),
    db.comment.count({
      where: { article: { clientId }, status: CommentStatus.REJECTED },
    }),
  ]);

  return {
    total,
    pending,
    approved,
    rejected,
  };
}

export async function getPendingCommentsCount(clientId: string): Promise<number> {
  return db.comment.count({
    where: {
      article: { clientId },
      status: CommentStatus.PENDING,
    },
  });
}
