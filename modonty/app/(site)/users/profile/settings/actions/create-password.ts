"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createPassword(
  userId: string,
  data: { password: string; confirmPassword: string }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // CREATE means create: an account that already has a password never changes it here —
    // that path is changePassword, which demands the current one. Without this guard the
    // create door overwrites an existing password with zero proof (same class as S-02).
    if (user.password) {
      return { success: false, error: "عندك كلمة مرور — غيّرها من «تغيير كلمة المرور»" };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, error: "كلمات المرور غير متطابقة" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    revalidatePath("/users/profile/settings");

    return { success: true };
  } catch (error) {
    console.error("Error creating password:", error);
    return { success: false, error: "Failed to create password" };
  }
}
