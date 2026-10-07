"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { updateProfileAs } from "@/lib/users/update-profile-as";
import { createPasswordAs } from "@/lib/users/create-password-as";
import { changePasswordAs } from "@/lib/users/change-password-as";
import { getAlertSettingsAs, type AlertSettings } from "@/lib/users/get-alert-settings-as";
import { updateAlertSettingsAs } from "@/lib/users/update-alert-settings-as";
import { deleteAccountAs } from "@/lib/users/delete-account-as";
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
    // Web door: identity from the session cookie, logic in `updateProfileAs` (shared with the mobile API).
    return await updateProfileAs(userId, data);
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
    // Web door: identity from the session cookie, logic in `createPasswordAs` (shared with the mobile API).
    return await createPasswordAs(userId, data);
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
    // Web door: identity from the session cookie, logic in `changePasswordAs` (shared with the mobile API).
    return await changePasswordAs(userId, data);
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

    // The deletion itself is shared with the reader app (DELETE /api/mobile/v1/me).
    await deleteAccountAs(userId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}

export type { AlertSettings };

/** The signed-in reader's alert choices, for the «التنبيهات» section. */
export async function getAlertSettings(): Promise<{ success: true; data: AlertSettings } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  // Web door: identity from the session cookie, logic in `getAlertSettingsAs` (shared with the mobile API).
  const data = await getAlertSettingsAs(session.user.id);
  if (!data) return { success: false, error: "Unauthorized" };
  return { success: true, data };
}

/**
 * Saves the «التنبيهات» section. The server is the gate: unknown topics and channels are dropped,
 * and a phone is required — and normalized to E.164 — only when WhatsApp or SMS is chosen.
 * Every consent is stamped with its date; a topic keeps its first date unless its channels change.
 */
export async function updateAlertSettings(raw: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    // Web door: identity from the session cookie, logic in `updateAlertSettingsAs` (shared with the mobile API).
    return await updateAlertSettingsAs(session.user.id, raw);
  } catch (error) {
    console.error("Error updating alert settings:", error);
    return { success: false, error: "تعذّر الحفظ، حاول مرة ثانية" };
  }
}
