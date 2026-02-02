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

    // Check if already favorited
    const existing = await db.articleFavorite.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already favorited" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Create favorite
    await db.articleFavorite.create({
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
            favorites: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        favorites: counts?._count.favorites || 0,
      },
    } as ApiResponse<{ favorites: number }>);
  } catch (error) {
    console.error("Error favoriting article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to favorite article" } as ApiResponse<never>,
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

    await db.articleFavorite.deleteMany({
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
            favorites: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        favorites: counts?._count.favorites || 0,
      },
    } as ApiResponse<{ favorites: number }>);
  } catch (error) {
    console.error("Error unfavoriting article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unfavorite article" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
