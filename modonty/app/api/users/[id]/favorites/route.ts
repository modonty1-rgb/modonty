import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ArticleStatus } from "@prisma/client";
import type { ApiResponse } from "@/app/api/helpers/types";

interface FavoritedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  datePublished: Date | null;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  client: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  author: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  favoritedAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    // Authorization: users can only see their own favorites
    if (!session?.user?.id || session.user.id !== id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } as ApiResponse<never>,
        { status: 401 }
      );
    }

    // Parse pagination from query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50); // Max 50 for performance
    const skip = (page - 1) * limit;

    // Fetch total count for pagination (optimized with count only)
    const totalCount = await db.articleFavorite.count({
      where: { userId: id },
    });

    // Fetch favorited articles with optimized select (only needed fields)
    const favorites = await db.articleFavorite.findMany({
      where: { userId: id },
      select: {
        createdAt: true,
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            datePublished: true,
            status: true,
            featuredImage: {
              select: {
                url: true,
                altText: true,
              },
            },
            client: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoMedia: {
                  select: {
                    url: true,
                  },
                },
              },
            },
            author: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Filter out unpublished articles and map to response format
    const favoritedArticles: FavoritedArticle[] = favorites
      .filter((fav) => fav.article.status === ArticleStatus.PUBLISHED)
      .map((fav) => ({
        id: fav.article.id,
        title: fav.article.title,
        slug: fav.article.slug,
        excerpt: fav.article.excerpt,
        datePublished: fav.article.datePublished,
        featuredImage: fav.article.featuredImage
          ? {
              url: fav.article.featuredImage.url,
              altText: fav.article.featuredImage.altText,
            }
          : null,
        client: {
          id: fav.article.client.id,
          name: fav.article.client.name,
          slug: fav.article.client.slug,
          logo: fav.article.client.logoMedia?.url || null,
        },
        author: {
          id: fav.article.author.id,
          name: fav.article.author.name,
          slug: fav.article.author.slug,
        },
        category: fav.article.category,
        favoritedAt: fav.createdAt,
      }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: favoritedArticles,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    } as ApiResponse<FavoritedArticle[]>);
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch favorites" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
