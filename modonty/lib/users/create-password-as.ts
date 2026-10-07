import "server-only";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

/**
 * First password for an account that has none (Google-first) — the body of `createPassword` with the
 * identity passed in. CREATE means create: an account that already has a password never changes
 * it here — that path is `changePasswordAs`, which demands the current one. Not a Server Action.
 */
export async function createPasswordAs(userId: string, data: { password: string; confirmPassword: string }) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Without this guard the create door overwrites an existing password with zero proof (S-02).
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
