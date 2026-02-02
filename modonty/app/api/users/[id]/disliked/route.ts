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

    console.log('[Disliked API] Phase 3: Fetching all disliked items for userId:', userId);

    const [clientDislikes, articleDislikes, commentDislikes, totalClients, totalArticles, totalComments] = await Promise.all([
      db.clientDislike.findMany({
        where: { userId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              logoMedia: {
                select: {
                  url: true,
                  altText: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.articleDislike.findMany({
        where: { userId },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              featuredImage: {
                select: {
                  url: true,
                  altText: true,
                },
              },
              client: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.commentDislike.findMany({
        where: { userId },
        include: {
          comment: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
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
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.clientDislike.count({ where: { userId } }),
      db.articleDislike.count({ where: { userId } }),
      db.commentDislike.count({ where: { userId } }),
    ]);

    const clientItems = clientDislikes.map((dislike) => ({
      id: dislike.id,
      type: "client" as const,
      dislikedAt: dislike.createdAt,
      item: {
        id: dislike.client.id,
        name: dislike.client.name,
        slug: dislike.client.slug,
        description: dislike.client.description,
        image: dislike.client.logoMedia?.url,
        imageAlt: dislike.client.logoMedia?.altText,
      },
    }));

    const articleItems = articleDislikes.map((dislike) => ({
      id: dislike.id,
      type: "article" as const,
      dislikedAt: dislike.createdAt,
      item: {
        id: dislike.article.id,
        title: dislike.article.title,
        slug: dislike.article.slug,
        excerpt: dislike.article.excerpt,
        image: dislike.article.featuredImage?.url,
        imageAlt: dislike.article.featuredImage?.altText,
        client: dislike.article.client,
      },
    }));

    const commentItems = commentDislikes.map((dislike) => ({
      id: dislike.id,
      type: "comment" as const,
      dislikedAt: dislike.createdAt,
      item: {
        id: dislike.comment.id,
        content: dislike.comment.content,
        slug: dislike.comment.article.slug,
        author: dislike.comment.author,
        article: dislike.comment.article,
        commentCreatedAt: dislike.comment.createdAt,
      },
    }));

    const allItems = [...clientItems, ...articleItems, ...commentItems].sort(
      (a, b) => b.dislikedAt.getTime() - a.dislikedAt.getTime()
    );

    const paginatedItems = allItems.slice(skip, skip + limit);
    const totalItems = totalClients + totalArticles + totalComments;

    console.log('[Disliked API] Phase 3: Returning', paginatedItems.length, 'items (', clientItems.length, 'clients,', articleItems.length, 'articles,', commentItems.length, 'comments)');

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("[Disliked API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch disliked items" },
      { status: 500 }
    );
  }
}
