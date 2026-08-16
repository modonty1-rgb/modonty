import { getUnreadNotificationCount } from "@/app/layout/components/notifications/get-unread-notification-count";

// The unread count over the phone header's avatar. Reads the session, so it streams in
// behind its own <Suspense fallback={null}> — the header itself no longer waits for it.
export async function MobileNotificationBadge() {
  const count = await getUnreadNotificationCount();
  if (!count) return null;

  return (
    <span className="pointer-events-none absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}
