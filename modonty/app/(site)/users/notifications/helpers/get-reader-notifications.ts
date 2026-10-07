import "server-only";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export type NotificationTab = "all" | "unread" | "read";

/**
 * One reader's notifications, unread first then newest — the list the inbox page shows and the
 * mobile API pages through. `cursor` (a notification id) continues after that row; the `id`
 * tiebreak keeps the order stable so a cursor never skips or repeats a row.
 */
export async function getReaderNotifications(
  userId: string,
  options: { tab?: NotificationTab; cursor?: string | null; limit: number },
) {
  const tab = options.tab ?? "all";
  const where: Prisma.NotificationWhereInput = {
    userId,
    // `readAt: null` alone misses rows where the field is absent (Mongo) — hence the OR.
    ...(tab === "unread" && { OR: [{ readAt: null }, { readAt: { isSet: false } }] }),
    ...(tab === "read" && { readAt: { not: null } }),
  };
  return db.notification.findMany({
    where,
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }, { id: "desc" }],
    take: options.limit,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
  });
}
