import { db } from "@/lib/db";

export type ActivityType =
  | "comment"
  | "like_comment"
  | "favorite_article"
  | "follow_client";

export interface ActivityEntry {
  type: ActivityType;
  content: string;
  link?: string;
  timestamp: Date;
}

export interface ActivityPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProfileActivity {
  activities: ActivityEntry[];
  pagination: ActivityPagination;
}

/**
 * Server-side counterpart of GET /api/users/[id]/activity — merges 4 activity
 * sources (comments, comment-likes, article favorites, client follows), sorts
 * by timestamp desc, then paginates. Not cached (per-request) because the
 * profile page is `noindex` and the data is highly user-specific.
 */
export async function getProfileActivity(
  userId: string,
  page = 1,
  limit = 10,
): Promise<ProfileActivity> {
  const [comments, commentLikes, favorites, following] = await Promise.all([
    db.comment.findMany({
      where: { authorId: userId, status: "APPROVED" },
      include: { article: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.commentLike.findMany({
      where: { userId },
      include: {
        comment: {
          include: { article: { select: { title: true, slug: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.articleFavorite.findMany({
      where: { userId },
      include: { article: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.clientFavorite.findMany({
      where: { userId },
      include: { client: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activities: ActivityEntry[] = [];

  comments.forEach((comment) => {
    activities.push({
      type: "comment",
      content: `علقت على "${comment.article.title}"`,
      link: `/articles/${comment.article.slug}#comment-${comment.id}`,
      timestamp: comment.createdAt,
    });
  });

  commentLikes.forEach((like) => {
    activities.push({
      type: "like_comment",
      content: `أعجبت بتعليق على "${like.comment.article.title}"`,
      link: `/articles/${like.comment.article.slug}#comment-${like.comment.id}`,
      timestamp: like.createdAt,
    });
  });

  favorites.forEach((fav) => {
    activities.push({
      type: "favorite_article",
      content: `حفظت مقال "${fav.article.title}"`,
      link: `/articles/${fav.article.slug}`,
      timestamp: fav.createdAt,
    });
  });

  following.forEach((follow) => {
    activities.push({
      type: "follow_client",
      content: `تابعت "${follow.client.name}"`,
      link: `/clients/${follow.client.slug}`,
      timestamp: follow.createdAt,
    });
  });

  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const total = activities.length;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(limit, 50));
  const skip = (safePage - 1) * safeLimit;

  return {
    activities: activities.slice(skip, skip + safeLimit),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}
