import { unstable_noStore } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { IconEmail } from "@/lib/icons";
import { cn } from "@/lib/utils";

export async function NotificationsBell() {
  unstable_noStore();

  const session = await auth();
  if (!session?.user?.id) return null;

  const unreadCount = await db.notification.count({
    where: {
      userId: session.user.id,
      OR: [{ readAt: null }, { readAt: { isSet: false } }],
    },
  });

  return (
    <Link
      href="/users/notifications"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "hover:bg-accent hover:text-accent-foreground h-11 w-11 rounded-xl relative"
      )}
      aria-label="صندوق البريد"
    >
      <IconEmail className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
