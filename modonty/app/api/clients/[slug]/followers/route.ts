import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const client = await db.client.findUnique({
      where: { slug: decodedSlug },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const followers = await db.clientLike.findMany({
      where: { clientId: client.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const data = followers.map((follower) => ({
      id: follower.id,
      userId: follower.user?.id ?? null,
      name: follower.user?.name ?? "متابع",
      image: follower.user?.image ?? null,
      followedAt: follower.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data,
    } as ApiResponse<
      {
        id: string;
        userId: string | null;
        name: string;
        image: string | null;
        followedAt: Date;
      }[]
    >);
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}

