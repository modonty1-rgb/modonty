import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import type { ApiResponse } from "@/lib/types";

export async function POST(
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
    const { currentPassword, newPassword } = body;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    if (user.password && currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: "كلمة المرور الحالية غير صحيحة" } as ApiResponse<never>,
          { status: 400 }
        );
      }
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Password updated" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { success: false, error: "Failed to change password" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
