import { LogoNav } from "@/components/navigatore/LogoNav";
import type { NavSection } from "@/components/navigatore/TopNav";
import { DesktopUserAreaClient } from "@/components/navigatore/DesktopUserAreaClient";
import { DesktopNavLinks } from "@/components/navigatore/NavLinksClient";

interface TopNavDesktopProps {
  activeSection: NavSection;
}

export function TopNavDesktop({ activeSection }: TopNavDesktopProps) {
  return (
    <div className="hidden md:grid md:grid-cols-[1fr_4.5fr_1fr] h-14 items-center gap-4 px-4">
      <div className="flex items-center gap-2 flex-1">
        <LogoNav />
      </div>
      <DesktopNavLinks activeSection={activeSection} />
      <DesktopUserAreaClient />
    </div>
  );
}

