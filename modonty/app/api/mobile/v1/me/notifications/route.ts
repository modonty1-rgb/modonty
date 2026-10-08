import { z } from "zod";

import { getReaderNotifications } from "@/lib/notifications/get-reader-notifications";
import { countUnreadNotifications } from "@/lib/notifications/count-unread-notifications";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { resolveNotificationTargets } from "@modonty/shared/lib/reader-push/notification-targets";
import { readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  tab: z.enum(["all", "unread", "read"]).default("all"),
  cursor: z.string().regex(/^[0-9a-f]{24}$/i).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * N1 — GET /api/mobile/v1/me/notifications?tab&cursor&limit · Bearer.
 * The inbox list (`getReaderNotifications`, the page's own query: unread first, then newest),
 * cursor-paged, each row with where it opens, plus the bell count.
 */
export const GET = handle("me-notifications", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const { tab, cursor, limit } = query.value;

  const [rows, unreadCount] = await Promise.all([
    getReaderNotifications(reader.id, { tab, cursor, limit }),
    countUnreadNotifications(reader.id),
  ]);
  const targets = await resolveNotificationTargets(rows);

  return ok({
    items: rows.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      readAt: n.readAt,
      createdAt: n.createdAt,
      clientId: n.clientId,
      relatedId: n.relatedId,
      target: targets.get(n.id) ?? null,
    })),
    nextCursor: rows.length === limit ? rows[rows.length - 1].id : null,
    unreadCount,
  });
});
