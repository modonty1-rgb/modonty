import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { countUnreadNotifications } from "@/lib/notifications/count-unread-notifications";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";

/**
 * N2 — POST /api/mobile/v1/me/notifications/read-all · Bearer. NEW (the web marks one at a time):
 * one `updateMany` over this reader's unread rows (null OR missing `readAt`).
 */
export const POST = handle("me-notifications-read-all", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const { count } = await db.notification.updateMany({
    where: { userId: reader.id, OR: [{ readAt: null }, { readAt: { isSet: false } }] },
    data: { readAt: new Date() },
  });
  if (count > 0) revalidatePath("/");
  return ok({ ok: true, marked: count, unreadCount: await countUnreadNotifications(reader.id) });
});
