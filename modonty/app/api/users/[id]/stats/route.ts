import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

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
        where: {
          authorId: userId,
          status: "APPROVED",
        },
      }),
      db.commentLike.count({
        where: {
          userId,
        },
      }),
      db.articleLike.count({
        where: {
          userId,
        },
      }),
      db.commentDislike.count({
        where: {
          userId,
        },
      }),
      db.articleFavorite.count({
        where: {
          userId,
        },
      }),
      db.clientFavorite.count({
        where: {
          userId,
        },
      }),
      db.user.findUnique({
        where: { id: userId },
        select: {
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        commentsCount,
        articleLikesCount,
        commentLikesCount,
        dislikesGiven: dislikesCount,
        favoritesCount,
        followingCount,
        joinedAt: user?.createdAt || new Date(),
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
