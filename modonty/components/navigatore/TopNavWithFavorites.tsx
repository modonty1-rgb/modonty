import { getFavoritesCountForNav } from "./get-favorites-count";
import { getUnreadNotificationCount } from "@/lib/notifications/get-unread-count";
import { TopNav } from "./TopNav";

export async function TopNavWithFavorites() {
  const [favoritesCount, notificationCount] = await Promise.all([
    getFavoritesCountForNav(),
    getUnreadNotificationCount(),
  ]);
  return <TopNav favoritesCount={favoritesCount} notificationCount={notificationCount} />;
}
