import { mainNavItems, type MainNavItem } from "@/lib/nav/nav-config";

/**
 * The destinations the chrome-free reels page offers — the desktop rail (`ReelsNavRail`).
 *
 * It reads `mainNavItems` — the same list the top bar and the burger menu read — so a renamed
 * section changes everywhere at once.
 */
export const reelsRailItems: MainNavItem[] = mainNavItems;
