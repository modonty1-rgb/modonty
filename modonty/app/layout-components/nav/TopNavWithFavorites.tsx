import { getFavoritesCountForNav } from "@/app/layout-helpers/get-favorites-count";
import { getUnreadNotificationCount } from "@/app/layout-components/notifications/get-unread-notification-count";
import { TopNav } from "./TopNav";

export async function TopNavWithFavorites() {
  const [favoritesCount, notificationCount] = await Promise.all([
    getFavoritesCountForNav(),
    getUnreadNotificationCount(),
  ]);
  return <TopNav favoritesCount={favoritesCount} notificationCount={notificationCount} />;
}
