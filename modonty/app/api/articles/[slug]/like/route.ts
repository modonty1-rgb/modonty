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

    const existing = await db.articleLike.findUnique({
      where: { articleId_userId: { articleId: article.id, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already liked" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const deletedDislikes = await db.articleDislike.deleteMany({
      where: { articleId: article.id, userId: session.user.id },
    });
    const hadDislike = deletedDislikes.count > 0;

    try {
      await db.articleLike.create({
        data: { articleId: article.id, userId: session.user.id, sessionId: `user:${session.user.id}` },
      });
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      const isUniqueViolation = err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
      if (!isUniqueViolation) throw e;
    }

    const updated = await db.article.update({
      where: { id: article.id },
      data: {
        likesCount: { increment: 1 },
        ...(hadDislike ? { dislikesCount: { decrement: 1 } } : {}),
      },
      select: { likesCount: true, dislikesCount: true },
    });

    return NextResponse.json({
      success: true,
      data: { likes: updated.likesCount, dislikes: updated.dislikesCount },
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

    const deleted = await db.articleLike.deleteMany({
      where: { articleId: article.id, userId: session.user.id },
    });

    let updated;
    if (deleted.count > 0) {
      updated = await db.article.update({
        where: { id: article.id },
        data: { likesCount: { decrement: 1 } },
        select: { likesCount: true, dislikesCount: true },
      });
    } else {
      updated = await db.article.findUnique({
        where: { id: article.id },
        select: { likesCount: true, dislikesCount: true },
      });
    }

    return NextResponse.json({
      success: true,
      data: { likes: updated?.likesCount ?? 0, dislikes: updated?.dislikesCount ?? 0 },
    } as ApiResponse<{ likes: number; dislikes: number }>);
  } catch (error) {
    console.error("Error unliking article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unlike article" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
