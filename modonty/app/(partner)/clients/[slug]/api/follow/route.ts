import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";
import { getClientFollowState } from "../../helpers/get-client-follow-state";
import { followClientAs } from "../../helpers/follow-client-as";
import { unfollowClientAs } from "../../helpers/unfollow-client-as";

// Web door: identity from the session cookie; the follow logic lives in ../../helpers/*
// (shared with the mobile API). Responses are unchanged.

export async function GET(
  _request: NextRequest,
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

    const result = await getClientFollowState(session.user.id, decodedSlug);

    if (!result.found) {
      return NextResponse.json(
        { success: false, error: "Client not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: result.isFollowing,
        followersCount: result.followersCount
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

    const result = await followClientAs(
      { id: session.user.id, name: session.user.name ?? null, email: session.user.email ?? null },
      decodedSlug,
      request.headers,
    );

    if (!result.found) {
      return NextResponse.json(
        { success: false, error: "Client not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: true,
        followersCount: result.followersCount
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
  _request: NextRequest,
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

    const result = await unfollowClientAs(session.user.id, decodedSlug);

    if (!result.found) {
      return NextResponse.json(
        { success: false, error: "Client not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: false,
        followersCount: result.followersCount
      }
    } as ApiResponse<{ isFollowing: boolean; followersCount: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to unfollow client" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
