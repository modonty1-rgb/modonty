import { mainNavItems, type MainNavItem } from "@/app/layout/helpers/nav-config";

/**
 * The destinations the chrome-free reels page offers, in one place for both of its shapes:
 * the desktop rail (`ReelsNavRail`) and the phone bottom bar (`ReelsBottomBar`).
 *
 * Both read `mainNavItems` — the same list the top bar and the burger menu read — so a renamed
 * section changes everywhere at once. What differs is only HOW MANY fit: the rail is a column
 * and takes all seven; a 390px bar cannot (55px per item is below any tap standard), so it
 * carries five, TikTok's own count on the phone.
 *
 * The five (Khalid, 24 Aug 2026): home · articles · reels · partners · audio. «الرائجة» is
 * reachable from the homepage it summarises, and «عن مدونتي» is a page a visitor reads once,
 * not a destination they return to — both stay in the rail, out of the bar.
 */
const BAR_HREFS = ["/", "/articles", "/reels", "/clients", "/audio"] as const;

export const reelsRailItems: MainNavItem[] = mainNavItems;

export const reelsBarItems: MainNavItem[] = BAR_HREFS.map((href) => {
  const item = mainNavItems.find((n) => n.href === href);
  // A href that no longer exists in `mainNavItems` means someone renamed a route and this list
  // was not updated — fail loudly at build rather than silently render a four-item bar.
  if (!item) throw new Error(`reelsBarItems: no nav item for "${href}"`);
  return item;
});
