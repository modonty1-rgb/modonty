import Link from "@/components/link";
import { cn } from "@/lib/utils";
import { mainNavItems } from "@/components/navigatore/nav-config";
import type { NavSection } from "@/components/navigatore/TopNav";
import { MobileMenuClient } from "./MobileMenuClient";

const FAVORITES_HREF = "/users/profile/favorites";

interface MobileFooterProps {
  activeSection: NavSection;
  favoritesCount?: number;
}

export function MobileFooter({ activeSection, favoritesCount }: MobileFooterProps) {
  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg">
      <nav className="flex items-center justify-around h-16 px-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.section === activeSection;
          const showBadge = item.href === FAVORITES_HREF && favoritesCount !== undefined && favoritesCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-4 py-2 min-h-11 min-w-11 rounded-md transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative inline-flex">
                <Icon className="h-5 w-5" />
                {showBadge && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[1rem] h-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] px-1"
                    aria-label={`${favoritesCount} محفوظ`}
                  >
                    {favoritesCount > 99 ? "99+" : favoritesCount}
                  </span>
                )}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        <MobileMenuClient />
      </nav>
    </footer>
  );
}
