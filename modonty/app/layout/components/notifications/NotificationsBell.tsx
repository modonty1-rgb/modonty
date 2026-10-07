import Link from "next/link";
import { getUnreadNotificationCountForViewer } from "../../helpers/get-unread-notification-count-for-viewer";
import { IconEmail } from "@/lib/icons";
import { cn } from "@/lib/utils";

export async function NotificationsBell() {
  const unreadCount = await getUnreadNotificationCountForViewer();
  if (unreadCount === null) return null;

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
        <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-xs font-medium text-destructive-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
