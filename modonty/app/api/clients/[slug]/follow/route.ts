import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/app/api/helpers/types";

export async function GET(
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
    const decodedSlug = decodeURIComponent(slug);
    
    const client = await db.client.findUnique({
      where: { slug: decodedSlug },
      select: { id: true }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const followRecord = await db.clientLike.findUnique({
      where: {
        clientId_userId: {
          clientId: client.id,
          userId: session.user.id
        }
      }
    });

    const followersCount = await db.clientLike.count({
      where: { clientId: client.id }
    });

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: !!followRecord,
        followersCount
      }
    } as ApiResponse<{ isFollowing: boolean; followersCount: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}

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
    const decodedSlug = decodeURIComponent(slug);
    
    const client = await db.client.findUnique({
      where: { slug: decodedSlug },
      select: { id: true }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    await db.clientLike.upsert({
      where: {
        clientId_userId: {
          clientId: client.id,
          userId: session.user.id
        }
      },
      create: {
        clientId: client.id,
        userId: session.user.id
      },
      update: {}
    });

    const followersCount = await db.clientLike.count({
      where: { clientId: client.id }
    });

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: true,
        followersCount
      }
    } as ApiResponse<{ isFollowing: boolean; followersCount: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to follow client" } as ApiResponse<never>,
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
    const decodedSlug = decodeURIComponent(slug);
    
    const client = await db.client.findUnique({
      where: { slug: decodedSlug },
      select: { id: true }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    await db.clientLike.deleteMany({
      where: {
        clientId: client.id,
        userId: session.user.id
      }
    });

    const followersCount = await db.clientLike.count({
      where: { clientId: client.id }
    });

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: false,
        followersCount
      }
    } as ApiResponse<{ isFollowing: boolean; followersCount: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to unfollow client" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
