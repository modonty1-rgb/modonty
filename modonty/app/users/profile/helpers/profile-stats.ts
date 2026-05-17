import { db } from "@/lib/db";

export interface ProfileStats {
  commentsCount: number;
  articleLikesCount: number;
  commentLikesCount: number;
  dislikesGiven: number;
  favoritesCount: number;
  followingCount: number;
  joinedAt: Date;
}

/**
 * Server-side counterpart of GET /api/users/[id]/stats — used to render the
 * profile page without a client-side fetch waterfall. Per-request (not cached)
 * because counts mutate frequently and the page is `noindex` (no SEO benefit
 * from caching).
 */
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [
    commentsCount,
    commentLikesCount,
    articleLikesCount,
    dislikesCount,
    favoritesCount,
    followingCount,
    user,
  ] = await Promise.all([
    db.comment.count({
      where: { authorId: userId, status: "APPROVED" },
    }),
    db.commentLike.count({ where: { userId } }),
    db.articleLike.count({ where: { userId } }),
    db.commentDislike.count({ where: { userId } }),
    db.articleFavorite.count({ where: { userId } }),
    db.clientFavorite.count({ where: { userId } }),
    db.user.findUnique({
      where: { id: userId },
      select: { createdAt: true, bio: true },
    }),
  ]);

  return {
    commentsCount,
    articleLikesCount,
    commentLikesCount,
    dislikesGiven: dislikesCount,
    favoritesCount,
    followingCount,
    joinedAt: user?.createdAt ?? new Date(),
  };
}

export async function getProfileBio(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { bio: true },
  });
  return user?.bio ?? null;
}
