"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { NotificationLike } from "./registry";

const DEFAULT_LIMIT = 20;

interface NotificationListResult {
  items: NotificationLike[];
  unreadCount: number;
}

/** Returns the most recent notifications for the current admin user + unread count. */
export async function listMyNotificationsAction(
  limit: number = DEFAULT_LIMIT
): Promise<NotificationListResult> {
  const session = await auth();
  const staffId = session?.user?.id;
  if (!staffId) return { items: [], unreadCount: 0 };

  const [items, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { staffId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        relatedId: true,
        clientId: true,
        readAt: true,
        createdAt: true,
      },
    }),
    db.notification.count({
      where: {
        staffId,
        OR: [{ readAt: null }, { readAt: { isSet: false } }],
      },
    }),
  ]);

  return { items, unreadCount };
}

/** Marks a single notification as read (only if owned by current user). */
export async function markNotificationReadAction(
  id: string
): Promise<{ success: boolean }> {
  const session = await auth();
  const staffId = session?.user?.id;
  if (!staffId) return { success: false };

  try {
    await db.notification.updateMany({
      where: {
        id,
        staffId,
        OR: [{ readAt: null }, { readAt: { isSet: false } }],
      },
      data: { readAt: new Date() },
    });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false };
  }
}

/** Marks ALL of the current user's unread notifications as read. */
export async function markAllNotificationsReadAction(): Promise<{
  success: boolean;
  count: number;
}> {
  const session = await auth();
  const staffId = session?.user?.id;
  if (!staffId) return { success: false, count: 0 };

  try {
    const result = await db.notification.updateMany({
      where: {
        staffId,
        OR: [{ readAt: null }, { readAt: { isSet: false } }],
      },
      data: { readAt: new Date() },
    });
    revalidatePath("/");
    return { success: true, count: result.count };
  } catch {
    return { success: false, count: 0 };
  }
}
