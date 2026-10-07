import { db } from "@/lib/db";

interface ProfileStats {
  commentsCount: number;
  articleLikesCount: number;
  commentLikesCount: number;
  dislikesGiven: number;
  favoritesCount: number;
  followingCount: number;
  bookingsCount: number;
  joinedAt: Date;
}

/**
 * Reads directly on the server — the old /api endpoint was removed — used to render the
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
    bookingsCount,
    user,
  ] = await Promise.all([
    db.comment.count({
      where: { authorId: userId, status: "APPROVED" },
    }),
    db.commentLike.count({ where: { userId } }),
    db.articleLike.count({ where: { userId } }),
    db.commentDislike.count({ where: { userId } }),
    db.articleFavorite.count({ where: { userId } }),
    // Following a partner writes ClientLike (clients/[slug]/api/follow) — the following tab and
    // the partner's follower count read it too; ClientFavorite here showed 0 after a follow (QA #9).
    db.clientLike.count({ where: { userId } }),
    db.bookingRequest.count({ where: { userId } }),
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
    bookingsCount,
    joinedAt: user?.createdAt ?? new Date(),
  };
}
