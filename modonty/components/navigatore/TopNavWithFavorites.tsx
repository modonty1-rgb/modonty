import { getFavoritesCountForNav } from "./get-favorites-count";
import { TopNav } from "./TopNav";

export async function TopNavWithFavorites() {
  const favoritesCount = await getFavoritesCountForNav();
  return <TopNav activeSection="home" favoritesCount={favoritesCount} />;
}
