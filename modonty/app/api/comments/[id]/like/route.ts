import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: commentId } = await params;
    const userId = session.user.id;


    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    const existingLike = await db.commentLike.findFirst({
      where: {
        commentId,
        userId,
      },
    });

    const existingDislike = await db.commentDislike.findFirst({
      where: {
        commentId,
        userId,
      },
    });


    if (existingLike) {
      await db.commentLike.deleteMany({
        where: {
          commentId,
          userId,
        },
      });
    } else {
      if (existingDislike) {
        await db.commentDislike.deleteMany({
          where: {
            commentId,
            userId,
          },
        });
      }

      await db.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });
    }

    const [likesCount, dislikesCount] = await Promise.all([
      db.commentLike.count({ where: { commentId } }),
      db.commentDislike.count({ where: { commentId } }),
    ]);


    const responseData = {
      success: true,
      data: {
        likesCount,
        dislikesCount,
        userLiked: !existingLike,
        userDisliked: false,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[API ERROR] Error toggling comment like:', error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
