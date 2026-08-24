import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

/**
 * The two fields this endpoint is allowed to write, and nothing else — the body used to reach
 * Prisma unread. `image` is rendered as the avatar's `src` everywhere the user appears, so a
 * `javascript:`/`data:` URL saved once came back out on every one of those pages; `new URL()`
 * accepts both, which is why the scheme is pinned rather than left to `.url()`. An unbounded
 * `name` is a megabyte the profile query then carries on every read.
 * The row being written is chosen by the session above, never by anything in here.
 */
const profileUpdateSchema = z.object({
  type: z.literal("profile"),
  data: z.object({
    name: z.string().trim().min(2).max(60),
    image: z
      .string()
      .max(500)
      .refine((value) => value === "" || value.startsWith("https://"), {
        message: "Avatar URL must be https",
      })
      .nullish(),
  }),
});

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
      select: {
        name: true,
        email: true,
        image: true,
        password: true,
        notificationPreferences: true,
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

    const defaultNotifications = {
      emailCommentReplies: true,
      emailCommentLikes: true,
      emailArticleLikes: true,
      emailNewArticles: true,
      emailWeeklyDigest: false,
      inAppNotifications: true,
      notificationSound: true,
      pushNotifications: false,
    };

    const stored = user.notificationPreferences as Record<string, boolean> | null;

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
      notifications: stored ? { ...defaultNotifications, ...stored } : defaultNotifications,
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

    const parsed = profileUpdateSchema.safeParse(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid settings payload",
          fields: parsed.error.flatten().fieldErrors,
        } as ApiResponse<never> & { fields: Record<string, string[] | undefined> },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.data.name,
        image: parsed.data.data.image || null,
      },
    });

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
