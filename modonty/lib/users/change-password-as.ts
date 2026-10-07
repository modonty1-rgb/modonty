import "server-only";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { passwordSchema } from "@/app/(site)/users/profile/settings/helpers/schemas/settings-schemas";

/**
 * Change the password of a known reader — the body of `changePassword` with the identity passed in.
 * Server-side validation is the real gate (S-02, QA 2026-08-20: the action trusted a raw type, so a
 * request that simply omitted currentPassword skipped the bcrypt check and took over the account).
 * Not a Server Action on purpose.
 */
export async function changePasswordAs(userId: string, data: unknown) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const parsed = passwordSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
    }

    // An account that HAS a password never changes it without proving the current one.
    // The schema keeps currentPassword optional only for Google-first accounts, which
    // have no password to prove — and those go through createPassword anyway.
    if (user.password) {
      if (!parsed.data.currentPassword) {
        return { success: false, error: "كلمة المرور الحالية مطلوبة" };
      }
      const isPasswordValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
      if (!isPasswordValid) {
        return { success: false, error: "كلمة المرور الحالية غير صحيحة" };
      }
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    revalidatePath("/users/profile/settings");

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}
