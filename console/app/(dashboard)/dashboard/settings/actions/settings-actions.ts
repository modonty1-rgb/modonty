"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type NotificationPreferences = {
  articlePublished?: boolean;
  articleApproved?: boolean;
  digest?: "none" | "weekly" | "monthly";
  commentsNew?: boolean;
  supportReplies?: boolean;
};

type SettingsUpdate = {
  notificationPreferences?: NotificationPreferences | null;
};

export async function updateClientSettings(
  clientId: string,
  data: SettingsUpdate
) {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) return { success: false, error: "Client not found" };

    await db.client.update({
      where: { id: clientId },
      data: {
        ...(data.notificationPreferences !== undefined && {
          notificationPreferences: data.notificationPreferences as object | null,
        }),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return { success: false, error: message };
  }
}
