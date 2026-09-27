"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { toInternationalPhone } from "@/lib/users/to-international-phone";
import { ALERT_CHANNELS, ALERT_TOPICS, PHONE_CHANNELS, type AlertChannelId, type AlertTopicId } from "@/lib/users/alert-topics";
import { readAlertPreferences } from "@/lib/users/read-alert-preferences";
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

const alertsInput = z.object({
  marketingEmails: z.boolean(),
  /** Per topic, the channels chosen — an empty list turns the topic off. */
  topics: z.record(z.string(), z.array(z.string()).max(3)),
  /** Dial code without + («966») or «other» when the reader typed the full international number. */
  phoneDial: z.string().trim().max(8).optional().default("966"),
  phone: z.string().trim().max(30).optional().default(""),
});

export interface AlertSettings {
  email: string | null;
  phone: string | null;
  marketingEmails: boolean;
  topics: Partial<Record<AlertTopicId, AlertChannelId[]>>;
}

/** The signed-in reader's alert choices, for the «التنبيهات» section. */
export async function getAlertSettings(): Promise<{ success: true; data: AlertSettings } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, phone: true, notificationPreferences: true },
  });
  if (!user) return { success: false, error: "Unauthorized" };
  const prefs = readAlertPreferences(user.notificationPreferences);
  const topics: AlertSettings["topics"] = {};
  for (const [id, t] of Object.entries(prefs.topics)) topics[id as AlertTopicId] = t!.channels;
  return { success: true, data: { email: user.email, phone: user.phone, marketingEmails: prefs.marketingEmails, topics } };
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

    const parsed = alertsInput.safeParse(raw);
    if (!parsed.success) return { success: false, error: "بيانات غير صالحة" };

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { notificationPreferences: true, phone: true } });
    if (!user) return { success: false, error: "Unauthorized" };

    const current = user.notificationPreferences && typeof user.notificationPreferences === "object"
      ? (user.notificationPreferences as Record<string, unknown>)
      : {};
    const before = readAlertPreferences(current);
    const now = new Date().toISOString();
    const knownTopics = new Set<string>(ALERT_TOPICS.map((t) => t.id));
    const knownChannels = new Set<string>(ALERT_CHANNELS.map((c) => c.id));

    const topics: Record<string, { channels: AlertChannelId[]; consentAt: string }> = {};
    for (const [id, list] of Object.entries(parsed.data.topics)) {
      if (!knownTopics.has(id)) continue;
      const channels = [...new Set(list.filter((c) => knownChannels.has(c)))] as AlertChannelId[];
      if (!channels.length) continue;
      const prev = before.topics[id as AlertTopicId];
      const same = prev && prev.channels.length === channels.length && channels.every((c) => prev.channels.includes(c));
      topics[id] = { channels, consentAt: same ? prev!.consentAt : now };
    }

    const needsPhone = Object.values(topics).some((t) => t.channels.some((c) => PHONE_CHANNELS.includes(c)));
    let phone = user.phone;
    if (parsed.data.phone) {
      // Any country, not Saudi/Egypt only (Khalid: «ممكن يكون اي جنسية») — stored as E.164, the form
      // WhatsApp's API takes.
      const international = toInternationalPhone(parsed.data.phoneDial, parsed.data.phone);
      if (!international) return { success: false, error: "رقم الجوال غير صحيح — اختر الدولة واكتب رقمك" };
      phone = international;
    }
    if (needsPhone && !phone) return { success: false, error: "اكتب رقم جوالك عشان توصلك رسائل واتساب" };

    const marketingEmails = parsed.data.marketingEmails;
    await db.user.update({
      where: { id: session.user.id },
      data: {
        phone,
        notificationPreferences: {
          ...current,
          marketingEmails,
          marketingConsentAt: marketingEmails
            ? (before.marketingEmails ? (current.marketingConsentAt as string | null) ?? now : now)
            : null,
          topics,
        },
      },
    });

    revalidatePath("/users/profile/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating alert settings:", error);
    return { success: false, error: "تعذّر الحفظ، حاول مرة ثانية" };
  }
}
