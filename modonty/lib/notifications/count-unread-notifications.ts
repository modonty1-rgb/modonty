import "server-only";

import { db } from "@/lib/db";

/**
 * Unread notifications of one reader. `readAt` null OR missing — in Mongo `readAt: null` alone
 * does not match an absent field. Shared by the web bell (`getUnreadNotificationCount`) and the
 * mobile API.
 */
export async function countUnreadNotifications(userId: string): Promise<number> {
  return db.notification.count({
    where: {
      userId,
      OR: [{ readAt: null }, { readAt: { isSet: false } }],
    },
  });
}
