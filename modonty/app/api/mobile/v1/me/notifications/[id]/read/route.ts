import { revalidatePath } from "next/cache";

import { markNotificationReadAs } from "@/lib/notifications/mark-notification-read-as";
import { countUnreadNotifications } from "@/lib/notifications/count-unread-notifications";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";

/**
 * N2 — POST /api/mobile/v1/me/notifications/:id/read · Bearer.
 * `markNotificationReadAs` — the web action's update, scoped to this reader (someone else's id
 * changes nothing → 404). Already-read stays 200. Revalidates "/" like the web action.
 */
export const POST = handle("me-notification-read", async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const { id } = await params;
  const malformed = rejectMalformedIds([id], MESSAGES.notificationNotFound);
  if (malformed) return malformed;

  const changed = await markNotificationReadAs(reader.id, id);
  if (changed === 0) return fail("NOT_FOUND", MESSAGES.notificationNotFound);
  revalidatePath("/");
  return ok({ ok: true, unreadCount: await countUnreadNotifications(reader.id) });
});
