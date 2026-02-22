import { getFavoritesCountForNav } from "./get-favorites-count";
import { MobileFooter } from "./MobileFooter";

export async function MobileFooterWithFavorites() {
  const favoritesCount = await getFavoritesCountForNav();
  return <MobileFooter activeSection="home" favoritesCount={favoritesCount} />;
}
