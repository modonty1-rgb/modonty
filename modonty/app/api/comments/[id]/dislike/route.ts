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

    const existingDislike = await db.commentDislike.findFirst({
      where: {
        commentId,
        userId,
      },
    });

    const existingLike = await db.commentLike.findFirst({
      where: {
        commentId,
        userId,
      },
    });


    if (existingDislike) {
      await db.commentDislike.deleteMany({
        where: {
          commentId,
          userId,
        },
      });
    } else {
      if (existingLike) {
        await db.commentLike.deleteMany({
          where: {
            commentId,
            userId,
          },
        });
      }

      await db.commentDislike.create({
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
        userLiked: false,
        userDisliked: !existingDislike,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[API ERROR] Error toggling comment dislike:', error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle dislike" },
      { status: 500 }
    );
  }
}
