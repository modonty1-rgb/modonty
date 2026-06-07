"use client";

import { usePathname } from "next/navigation";
import { SearchLink } from "@/components/navigatore/SearchLink";
import { DesktopNavItem } from "@/components/navigatore/DesktopNavItem";
import { MazayaNavTrigger } from "@/components/navigatore/MazayaNavTrigger";
import { mainNavItems } from "@/components/navigatore/nav-config";

const FAVORITES_HREF = "/users/profile/favorites";

interface DesktopNavLinksProps {
  favoritesCount?: number;
}

export function DesktopNavLinks({ favoritesCount }: DesktopNavLinksProps) {
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
              badge={item.href === FAVORITES_HREF ? favoritesCount : undefined}
            />
          );
        })}
        <MazayaNavTrigger />
      </nav>
    </div>
  );
}
