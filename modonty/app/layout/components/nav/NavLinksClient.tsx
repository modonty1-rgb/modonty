"use client";

import { usePathname } from "next/navigation";
import { SearchLink } from "@/app/layout/components/nav/SearchLink";
import { DesktopNavItem } from "@/app/layout/components/nav/DesktopNavItem";
import { mainNavItems } from "@/app/layout/helpers/nav-config";

export function DesktopNavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-3">
      <SearchLink />
      <nav aria-label="التنقل الرئيسي" className="flex items-center gap-0.5 flex-shrink-0">
        {mainNavItems.map((item) => {
          // Home matches the exact root only; others match their path prefix
          // (e.g. /clients/[slug]). Same logic the mobile footer already uses.
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <DesktopNavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={active}
            />
          );
        })}
      </nav>
    </div>
  );
}
