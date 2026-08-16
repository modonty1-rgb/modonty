"use client";

import { usePathname } from "next/navigation";
import { SearchLink } from "@/app/layout/components/nav/SearchLink";
import { DesktopNavItem } from "@/app/layout/components/nav/DesktopNavItem";
import { mainNavItems } from "@/app/layout/helpers/nav-config";

// Presentational: the same links whether or not the pathname is known yet, so the
// Suspense fallback below is the real nav minus the active mark — nothing moves.
export function DesktopNavList({ pathname }: { pathname: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <SearchLink />
      <nav aria-label="التنقل الرئيسي" className="flex items-center gap-0.5 flex-shrink-0">
        {mainNavItems.map((item) => {
          // Home matches the exact root only; others match their path prefix
          // (e.g. /clients/[slug]). Same logic the mobile footer already uses.
          const active =
            pathname !== null && (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));
          return (
            <DesktopNavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={active}
              tone={item.tone}
            />
          );
        })}
      </nav>
    </div>
  );
}

// `usePathname` on a route with a dynamic param needs a Suspense boundary under
// cacheComponents (use-pathname.md, "Good to know") — the caller wraps this and uses
// <DesktopNavList pathname={null} /> as the fallback.
export function DesktopNavLinks() {
  const pathname = usePathname();
  return <DesktopNavList pathname={pathname} />;
}
