import { SearchLink } from "@/components/navigatore/SearchLink";
import { DesktopNavItem } from "@/components/navigatore/DesktopNavItem";
import type { NavSection } from "@/components/navigatore/TopNav";
import { mainNavItems } from "@/components/navigatore/nav-config";

interface DesktopNavLinksProps {
  activeSection: NavSection;
}

export function DesktopNavLinks({ activeSection }: DesktopNavLinksProps) {
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
          />
        ))}
      </nav>
    </div>
  );
}

