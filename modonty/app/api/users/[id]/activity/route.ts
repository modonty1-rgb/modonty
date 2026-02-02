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

    const [comments, commentLikes, favorites, following] = await Promise.all([
      db.comment.findMany({
        where: {
          authorId: userId,
          status: "APPROVED",
        },
        include: {
          article: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.commentLike.findMany({
        where: {
          userId,
        },
        include: {
          comment: {
            include: {
              article: {
                select: {
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.articleFavorite.findMany({
        where: {
          userId,
        },
        include: {
          article: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.clientFavorite.findMany({
        where: {
          userId,
        },
        include: {
          client: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const activities: Array<{
      type: "comment" | "like_comment" | "favorite_article" | "follow_client";
      content: string;
      link?: string;
      timestamp: Date;
    }> = [];

    comments.forEach((comment) => {
      activities.push({
        type: "comment",
        content: `علقت على "${comment.article.title}"`,
        link: `/articles/${comment.article.slug}#comment-${comment.id}`,
        timestamp: comment.createdAt,
      });
    });

    commentLikes.forEach((like) => {
      activities.push({
        type: "like_comment",
        content: `أعجبت بتعليق على "${like.comment.article.title}"`,
        link: `/articles/${like.comment.article.slug}#comment-${like.comment.id}`,
        timestamp: like.createdAt,
      });
    });

    favorites.forEach((fav) => {
      activities.push({
        type: "favorite_article",
        content: `حفظت مقال "${fav.article.title}"`,
        link: `/articles/${fav.article.slug}`,
        timestamp: fav.createdAt,
      });
    });

    following.forEach((follow) => {
      activities.push({
        type: "follow_client",
        content: `تابعت "${follow.client.name}"`,
        link: `/clients/${follow.client.slug}`,
        timestamp: follow.createdAt,
      });
    });

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = activities.length;
    const skip = (page - 1) * limit;
    const paginatedActivities = activities.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginatedActivities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
