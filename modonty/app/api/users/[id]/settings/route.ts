import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: userId } = await params;

    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const settings = {
      profile: {
        name: user.name,
        email: user.email,
        image: user.image,
        bio: null,
      },
      privacy: {
        profileVisibility: "public",
        showEmail: false,
        showActivity: true,
        showComments: true,
        showLikes: true,
        showFavorites: true,
      },
      notifications: {
        emailCommentReplies: true,
        emailCommentLikes: true,
        emailArticleLikes: true,
        emailNewArticles: true,
        emailWeeklyDigest: false,
        inAppNotifications: true,
        notificationSound: true,
        pushNotifications: false,
      },
      preferences: {
        theme: "system",
        language: "ar",
        fontSize: "medium",
        layout: "comfortable",
        defaultSort: "newest",
        itemsPerPage: 10,
        autoExpandComments: false,
      },
      accounts: user.accounts,
      hasPassword: !!user.password,
    };

    return NextResponse.json({
      success: true,
      data: settings,
    } as ApiResponse<typeof settings>);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: userId } = await params;

    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, data } = body;

    if (type === "profile") {
      await db.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          image: data.image || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { message: "Settings updated" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
