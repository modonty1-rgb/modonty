import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: {
        userId: session.user.id,
        OR: [{ readAt: null }, { readAt: { isSet: false } }],
      },
    });

    return NextResponse.json({
      success: true,
      data: { notifications, unreadCount },
    } as ApiResponse<{ notifications: typeof notifications; unreadCount: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to load notifications" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
