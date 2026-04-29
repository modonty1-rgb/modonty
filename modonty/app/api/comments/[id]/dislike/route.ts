import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify";

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

    if (!existingDislike) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        null;
      db.comment
        .findUnique({
          where: { id: commentId },
          select: { article: { select: { clientId: true, title: true } } },
        })
        .then((c) => {
          if (c?.article?.clientId) {
            notifyTelegram(c.article.clientId, "commentDislike", {
              title: c.article.title,
              ipAddress: ip,
              headers: req.headers,
            }).catch(() => {});
          }
        })
        .catch(() => {});
    }

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
