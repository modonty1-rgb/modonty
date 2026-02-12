import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CommentStatus, ArticleStatus } from "@prisma/client";
import type { ApiResponse } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const article = await db.article.findFirst({
      where: {
        slug: decodedSlug,
        status: ArticleStatus.PUBLISHED,
      },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const comments = await db.comment.findMany({
      where: {
        articleId: article.id,
        status: CommentStatus.APPROVED,
        parentId: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            dislikes: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
                dislikes: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    if (userId) {
      const commentIds = comments.flatMap(c => [c.id, ...c.replies.map(r => r.id)]);

      const [userLikes, userDislikes] = await Promise.all([
        db.commentLike.findMany({
          where: {
            commentId: { in: commentIds },
            userId,
          },
          select: { commentId: true },
        }),
        db.commentDislike.findMany({
          where: {
            commentId: { in: commentIds },
            userId,
          },
          select: { commentId: true },
        }),
      ]);

      const likedIds = new Set(userLikes.map(l => l.commentId));
      const dislikedIds = new Set(userDislikes.map(d => d.commentId));

      const enrichedComments = comments.map(comment => ({
        ...comment,
        likes: likedIds.has(comment.id) ? [{ id: 'user-like' }] : [],
        dislikes: dislikedIds.has(comment.id) ? [{ id: 'user-dislike' }] : [],
        replies: comment.replies.map(reply => ({
          ...reply,
          likes: likedIds.has(reply.id) ? [{ id: 'user-like' }] : [],
          dislikes: dislikedIds.has(reply.id) ? [{ id: 'user-dislike' }] : [],
        })),
      }));

      return NextResponse.json({
        success: true,
        data: enrichedComments,
      } as ApiResponse<typeof enrichedComments>);
    }

    return NextResponse.json({
      success: true,
      data: comments,
    } as ApiResponse<typeof comments>);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to comment." } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Find article
    const article = await db.article.findFirst({
      where: {
        slug: decodedSlug,
        status: ArticleStatus.PUBLISHED,
      },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content } = body;

    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "Comment content is required" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length < 3) {
      return NextResponse.json(
        { success: false, error: "Comment must be at least 3 characters long" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Comment must be less than 2000 characters" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Create comment with PENDING status
    const comment = await db.comment.create({
      data: {
        articleId: article.id,
        authorId: session.user.id,
        content: trimmedContent,
        status: CommentStatus.PENDING,
      },
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: comment.id,
        message: "Your comment is pending approval and will appear after review.",
      },
    } as ApiResponse<{ id: string; message: string }>);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create comment" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
