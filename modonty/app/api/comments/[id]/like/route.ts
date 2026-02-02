import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('====================================');
  console.log('[API ENTRY] /api/comments/[id]/like POST handler called');
  console.log('[API ENTRY] Time:', new Date().toISOString());
  console.log('[API ENTRY] URL:', req.url);
  console.log('====================================');

  try {
    const session = await auth();
    console.log('[API AUTH] Session check:', { 
      hasSession: !!session, 
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id 
    });

    if (!session?.user?.id) {
      console.log('[API AUTH] UNAUTHORIZED - No valid session');
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: commentId } = await params;
    const userId = session.user.id;

    console.log('[Comment Like API]', { commentId, userId, timestamp: new Date().toISOString() });

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

    console.log('[Comment Like API] Existing like:', existingLike ? 'YES' : 'NO', 'Existing dislike:', existingDislike ? 'YES' : 'NO');

    if (existingLike) {
      await db.commentLike.deleteMany({
        where: {
          commentId,
          userId,
        },
      });
      console.log('[Comment Like API] Action: REMOVED like');
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
      console.log('[Comment Like API] Action: ADDED like');
    }

    const [likesCount, dislikesCount] = await Promise.all([
      db.commentLike.count({ where: { commentId } }),
      db.commentDislike.count({ where: { commentId } }),
    ]);

    console.log('[Comment Like API] Result:', { likesCount, dislikesCount, userLiked: !existingLike });

    const responseData = {
      success: true,
      data: {
        likesCount,
        dislikesCount,
        userLiked: !existingLike,
        userDisliked: false,
      },
    };

    console.log('[API EXIT] Sending success response:', responseData);
    console.log('====================================');
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[API ERROR] Error toggling comment like:', error);
    console.log('====================================');
    return NextResponse.json(
      { success: false, error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
