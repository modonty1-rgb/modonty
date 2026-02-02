"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import type {
  ProfileFormData,
  PasswordFormData,
  PrivacyFormData,
  NotificationFormData,
  PreferencesFormData,
} from "../helpers/schemas/settings-schemas";

export async function updateProfile(userId: string, data: ProfileFormData) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        image: data.image || null,
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

    if (user.password && data.currentPassword) {
      const isPasswordValid = await bcrypt.compare(
        data.currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return { success: false, error: "كلمة المرور الحالية غير صحيحة" };
      }
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

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

export async function updatePrivacySettings(
  userId: string,
  settings: PrivacyFormData
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        // Store privacy settings in a JSON field or extend User model
        // For now, we'll use a simple approach
      },
    });

    revalidatePath("/users/profile/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return { success: false, error: "Failed to update privacy settings" };
  }
}

export async function updateNotificationSettings(
  userId: string,
  settings: NotificationFormData
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        // Store notification settings
      },
    });

    revalidatePath("/users/profile/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return { success: false, error: "Failed to update notification settings" };
  }
}

export async function updatePreferences(
  userId: string,
  preferences: PreferencesFormData
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        // Store preferences
      },
    });

    revalidatePath("/users/profile/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating preferences:", error);
    return { success: false, error: "Failed to update preferences" };
  }
}

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
