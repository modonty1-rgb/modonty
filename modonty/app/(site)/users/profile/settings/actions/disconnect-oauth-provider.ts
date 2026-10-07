"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// «الإشعارات» و«المظهر» و«الخصوصية» حُذفت من إعدادات القارئ (خالد ٢٠ أغسطس):
// حفظ المظهر والخصوصية كان يكتب كائناً فاضياً، ومفاتيح الإشعارات ما كان يقرأها أي كود.
export async function disconnectOAuthProvider(
  userId: string,
  _provider: string,
  accountId: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.accounts.length <= 1 && !user.password) {
      return {
        success: false,
        error: "لا يمكنك قطع الاتصال. يجب أن يكون لديك طريقة تسجيل دخول واحدة على الأقل",
      };
    }

    await db.account.delete({
      where: { id: accountId },
    });

    revalidatePath("/users/profile/settings");

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting OAuth provider:", error);
    return { success: false, error: "Failed to disconnect provider" };
  }
}
