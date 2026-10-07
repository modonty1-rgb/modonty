import { TAB_NEW, TAB_READ } from "./notification-tabs";

/** The inbox list narrowed by the tab: unread rows, read rows, or everything. */
export function filterNotificationsByTab<T extends { readAt: Date | null }>(notificationsList: T[], tab: string): T[] {
  return tab === TAB_NEW
    ? notificationsList.filter((n) => n.readAt == null)
    : tab === TAB_READ
      ? notificationsList.filter((n) => n.readAt != null)
      : notificationsList;
}
