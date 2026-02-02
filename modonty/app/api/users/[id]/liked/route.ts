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

    console.log('[Liked API] Phase 2: Fetching client and article likes for userId:', userId);

    // Phase 2: Fetch both client likes and article likes
    const [clientLikes, articleLikes, totalClients, totalArticles] = await Promise.all([
      db.clientLike.findMany({
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
      db.articleLike.findMany({
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
      db.clientLike.count({ where: { userId } }),
      db.articleLike.count({ where: { userId } }),
    ]);

    // Transform to unified format
    const clientItems = clientLikes.map((like) => ({
      id: like.id,
      type: "client" as const,
      likedAt: like.createdAt,
      item: {
        id: like.client.id,
        name: like.client.name,
        slug: like.client.slug,
        description: like.client.description,
        image: like.client.logoMedia?.url,
        imageAlt: like.client.logoMedia?.altText,
      },
    }));

    const articleItems = articleLikes.map((like) => ({
      id: like.id,
      type: "article" as const,
      likedAt: like.createdAt,
      item: {
        id: like.article.id,
        title: like.article.title,
        slug: like.article.slug,
        excerpt: like.article.excerpt,
        image: like.article.featuredImage?.url,
        imageAlt: like.article.featuredImage?.altText,
        client: like.article.client,
      },
    }));

    // Merge and sort by date
    const allItems = [...clientItems, ...articleItems].sort(
      (a, b) => b.likedAt.getTime() - a.likedAt.getTime()
    );

    // Apply pagination after merging
    const paginatedItems = allItems.slice(skip, skip + limit);
    const totalItems = totalClients + totalArticles;

    console.log('[Liked API] Phase 2: Returning', paginatedItems.length, 'items (', clientItems.length, 'clients,', articleItems.length, 'articles)');

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
    console.error("[Liked API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch liked items" },
      { status: 500 }
    );
  }
}
