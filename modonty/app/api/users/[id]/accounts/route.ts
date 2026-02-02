import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "../../../helpers/types";

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
        password: true,
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

    return NextResponse.json({
      success: true,
      data: {
        accounts: user.accounts,
        hasPassword: !!user.password,
      },
    } as ApiResponse<{ accounts: typeof user.accounts; hasPassword: boolean }>);
  } catch (error) {
    console.error("Error fetching user accounts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch accounts" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
