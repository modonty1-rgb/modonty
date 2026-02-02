import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "../../../helpers/types";

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

    // Check if already disliked
    const existing = await db.articleDislike.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already disliked" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Remove like if exists
    await db.articleLike.deleteMany({
      where: {
        articleId: article.id,
        userId: session.user.id,
      },
    });

    // Create dislike
    await db.articleDislike.create({
      data: {
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
    console.error("Error disliking article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dislike article" } as ApiResponse<never>,
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

    await db.articleDislike.deleteMany({
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
    console.error("Error undisliking article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to undislike article" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
