import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      db.comment.findMany({
        where: {
          authorId: userId,
          status: { not: "DELETED" },
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              client: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              dislikes: true,
              replies: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.comment.count({
        where: {
          authorId: userId,
          status: { not: "DELETED" },
        },
      }),
    ]);

    const transformedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      status: comment.status,
      article: {
        id: comment.article.id,
        title: comment.article.title,
        slug: comment.article.slug,
        client: comment.article.client,
      },
      likesCount: comment._count.likes,
      dislikesCount: comment._count.dislikes,
      repliesCount: comment._count.replies,
    }));

    return NextResponse.json({
      success: true,
      data: transformedComments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user comments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
