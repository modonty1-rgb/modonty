"use client";

import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mainNavItems } from "@/components/navigatore/nav-config";
import { MobileMenuClient } from "./MobileMenuClient";
import { IconSearch } from "@/lib/icons";

const FAVORITES_HREF = "/users/profile/favorites";

interface MobileFooterProps {
  favoritesCount?: number;
}

export function MobileFooter({ favoritesCount }: MobileFooterProps) {
  const pathname = usePathname();
  const isSearchActive = pathname === "/search";

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full max-w-full border-t border-border/50 bg-card shadow-lg">
      <nav className="flex items-center justify-around h-16 px-2" aria-label="التنقل السفلي">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const showBadge = item.href === FAVORITES_HREF && favoritesCount !== undefined && favoritesCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-h-11 min-w-11 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative inline-flex">
                <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
                {showBadge && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[1rem] h-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] px-1"
                    aria-label={`${favoritesCount} محفوظ`}
                  >
                    {favoritesCount! > 99 ? "99+" : favoritesCount}
                  </span>
                )}
              </span>
              <span className={cn("text-xs transition-all duration-200", isActive ? "font-bold" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
        <Link
          href="/search"
          className={cn(
            "relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-h-11 min-w-11 rounded-xl transition-all duration-200",
            isSearchActive
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
          )}
          aria-label="بحث المقالات"
          aria-current={isSearchActive ? "page" : undefined}
        >
          <IconSearch className={cn("h-5 w-5 transition-transform duration-200", isSearchActive && "scale-110")} />
          <span className={cn("text-xs transition-all duration-200", isSearchActive ? "font-bold" : "font-medium")}>بحث</span>
        </Link>
        <MobileMenuClient />
      </nav>
    </footer>
  );
}
