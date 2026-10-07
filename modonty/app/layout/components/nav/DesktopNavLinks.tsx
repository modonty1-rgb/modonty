"use client";

import { usePathname } from "next/navigation";
import type { SearchLinkLabels } from "./SearchLink";
import { DesktopNavList } from "./DesktopNavList";
import type { MainNavLabelKey } from "@/lib/nav/nav-items";

// `usePathname` on a route with a dynamic param needs a Suspense boundary under
// cacheComponents (use-pathname.md, "Good to know") — the caller wraps this and uses
// <DesktopNavList pathname={null} /> as the fallback.
export function DesktopNavLinks({ labels }: { labels: { mainNav: string; menuItems: Record<MainNavLabelKey, string> } & SearchLinkLabels }) {
  const pathname = usePathname();
  return <DesktopNavList pathname={pathname} labels={labels} />;
}
