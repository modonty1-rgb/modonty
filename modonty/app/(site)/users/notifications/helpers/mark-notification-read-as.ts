import "server-only";

import { db } from "@/lib/db";

/**
 * Mark one of THIS reader's notifications read — scoped by `userId`, so an id that belongs to
 * someone else updates nothing. Returns how many rows changed (0 or 1). Shared by the web
 * action (`markNotificationAsRead`) and the mobile API.
 */
export async function markNotificationReadAs(userId: string, notificationId: string): Promise<number> {
  const { count } = await db.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
  return count;
}
