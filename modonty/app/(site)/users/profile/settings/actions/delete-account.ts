"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function deleteAccount(userId: string, confirmation: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (confirmation !== "حذف") {
      return {
        success: false,
        error: "يرجى كتابة 'حذف' للتأكيد",
      };
    }

    await db.user.delete({
      where: { id: userId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
