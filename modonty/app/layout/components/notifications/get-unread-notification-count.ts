import { cache } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Unread notifications count for the nav avatar badge (mobile). 0 when logged out.
export const getUnreadNotificationCount = cache(async (): Promise<number> => {
  const session = await auth();
  if (session?.user?.id == null) return 0;
  return db.notification.count({
    where: {
      userId: session.user.id,
      OR: [{ readAt: null }, { readAt: { isSet: false } }],
    },
  });
});
