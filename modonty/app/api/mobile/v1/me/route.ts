import { getProfileStats } from "@/app/(site)/users/profile/helpers/profile-stats";
import { countUnreadNotifications } from "@/lib/notifications/count-unread-notifications";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readerProfile } from "@/lib/mobile-api/reader-profile";

/**
 * A8 — GET /api/mobile/v1/me · Bearer.
 * The reader (session fields, fresh), their profile stats (`getProfileStats`, the profile page's
 * read) and the bell count (`countUnreadNotifications`, the web badge's count).
 */
export const GET = handle("me", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const [user, stats, unreadNotifications] = await Promise.all([
    readerProfile(reader.id),
    getProfileStats(reader.id),
    countUnreadNotifications(reader.id),
  ]);
  if (!user) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  return ok({ user, stats, unreadNotifications });
});
