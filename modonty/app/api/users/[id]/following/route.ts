import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

interface FollowedClient {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  articleCount: number;
  followedAt: Date;
  industry: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    // Authorization: users can only see their own following list
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

    // Fetch total count for pagination
    const totalCount = await db.clientLike.count({
      where: { userId: id },
    });

    // Fetch followed clients with optimized select
    const following = await db.clientLike.findMany({
      where: { userId: id },
      select: {
        createdAt: true,
        client: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logoMedia: {
              select: {
                url: true,
              },
            },
            industry: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                articles: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Map to response format
    const followedClients: FollowedClient[] = following.map((follow) => ({
      id: follow.client.id,
      name: follow.client.name,
      slug: follow.client.slug,
      description: follow.client.description,
      logo: follow.client.logoMedia?.url || null,
      articleCount: follow.client._count.articles,
      followedAt: follow.createdAt,
      industry: follow.client.industry,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: followedClients,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    } as ApiResponse<FollowedClient[]>);
  } catch (error) {
    console.error("Error fetching user following:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch following" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
