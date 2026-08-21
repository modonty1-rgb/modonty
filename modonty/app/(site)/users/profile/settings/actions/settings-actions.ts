"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { profileSchema, passwordSchema } from "../helpers/schemas/settings-schemas";
import type {
  ProfileFormData,
  PasswordFormData,
} from "../helpers/schemas/settings-schemas";

export async function updateProfile(userId: string, data: ProfileFormData) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Server-side validation is the real gate — the client schema is UX only. This is what
    // stops a base64 `data:` avatar from being written into the document.
    const parsed = profileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name,
        image: parsed.data.image || null,
        bio: parsed.data.bio || null,
      },
    });

    revalidatePath("/users/profile");
    revalidatePath("/users/profile/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

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

export async function changePassword(
  userId: string,
  data: PasswordFormData
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

    // Server-side validation is the real gate — the client schema is UX only (S-02, QA
    // 2026-08-20: the action trusted a raw type, so a request that simply omitted
    // currentPassword skipped the bcrypt check and took over the account).
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
      const isPasswordValid = await bcrypt.compare(
        parsed.data.currentPassword,
        user.password
      );
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

// «الإشعارات» و«المظهر» و«الخصوصية» حُذفت من إعدادات القارئ (خالد ٢٠ أغسطس):
// حفظ المظهر والخصوصية كان يكتب كائناً فاضياً، ومفاتيح الإشعارات ما كان يقرأها أي كود.
export async function disconnectOAuthProvider(
  userId: string,
  provider: string,
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

export async function exportUserData(userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        comments: true,
        articleLikes: true,
        articleFavorites: true,
        clientFavorites: true,
        commentLikes: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const exportData = {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      comments: user.comments,
      articleLikes: user.articleLikes,
      articleFavorites: user.articleFavorites,
      clientFavorites: user.clientFavorites,
      commentLikes: user.commentLikes,
    };

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting user data:", error);
    return { success: false, error: "Failed to export data" };
  }
}

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
