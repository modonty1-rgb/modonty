import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const { slug } = await params;
    const article = await db.article.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    // Check if already liked
    const existing = await db.articleLike.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already liked" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Remove dislike if exists
    await db.articleDislike.deleteMany({
      where: {
        articleId: article.id,
        userId: session.user.id,
      },
    });

    // Create like
    await db.articleLike.create({
      data: {
        articleId: article.id,
        userId: session.user.id,
      },
    });

    // Get updated counts
    const counts = await db.article.findUnique({
      where: { id: article.id },
      select: {
        _count: {
          select: {
            likes: true,
            dislikes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        likes: counts?._count.likes || 0,
        dislikes: counts?._count.dislikes || 0,
      },
    } as ApiResponse<{ likes: number; dislikes: number }>);
  } catch (error) {
    console.error("Error liking article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to like article" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const { slug } = await params;
    const article = await db.article.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    await db.articleLike.deleteMany({
      where: {
        articleId: article.id,
        userId: session.user.id,
      },
    });

    const counts = await db.article.findUnique({
      where: { id: article.id },
      select: {
        _count: {
          select: {
            likes: true,
            dislikes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        likes: counts?._count.likes || 0,
        dislikes: counts?._count.dislikes || 0,
      },
    } as ApiResponse<{ likes: number; dislikes: number }>);
  } catch (error) {
    console.error("Error unliking article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unlike article" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
