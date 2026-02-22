import { SearchLink } from "@/components/navigatore/SearchLink";
import { DesktopNavItem } from "@/components/navigatore/DesktopNavItem";
import type { NavSection } from "@/components/navigatore/TopNav";
import { mainNavItems } from "@/components/navigatore/nav-config";

const FAVORITES_HREF = "/users/profile/favorites";

interface DesktopNavLinksProps {
  activeSection: NavSection;
  favoritesCount?: number;
}

export function DesktopNavLinks({ activeSection, favoritesCount }: DesktopNavLinksProps) {
  return (
    <div className="flex items-center gap-3">
      <SearchLink />
      <nav aria-label="التنقل الرئيسي" className="flex items-center gap-0.5 flex-shrink-0">
        {mainNavItems.map((item) => (
          <DesktopNavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={activeSection === item.section}
            badge={item.href === FAVORITES_HREF ? favoritesCount : undefined}
          />
        ))}
      </nav>
    </div>
  );
}

