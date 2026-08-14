import { getFavoritesCountForNav } from "@/app/layout-helpers/get-favorites-count";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { TopNav } from "./TopNav";

export async function TopNavWithFavorites() {
  const [favoritesCount, notificationCount] = await Promise.all([
    getFavoritesCountForNav(),
    getUnreadNotificationCount(),
  ]);
  return <TopNav favoritesCount={favoritesCount} notificationCount={notificationCount} />;
}
