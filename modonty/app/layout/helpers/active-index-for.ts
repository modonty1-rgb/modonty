import { mainNavItemDefs as mainNavItems } from "@/lib/nav/nav-items";
import { getNavSectionPath } from "./get-nav-section-path";

export function activeIndexFor(rawPathname: string | null): number {
  if (rawPathname === null) return 0;
  // A page without its own tab takes its parent section's (`/quran` → مدونتي).
  const pathname = getNavSectionPath(rawPathname);
  // Home matches the exact root only; others match their path prefix (e.g. /clients/[slug]).
  const i = mainNavItems.findIndex((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)));
  return Math.max(0, i);
}
