import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } as ApiResponse<never>,
        { status: 401 }
      );
    }
    const { id } = await params;

    await db.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { readAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: {},
    } as ApiResponse<Record<string, never>>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to mark as read" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
