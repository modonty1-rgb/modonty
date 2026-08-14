import { LogoNav } from "@/app/layout-components/nav/LogoNav";
import { DesktopUserAreaClient } from "@/app/layout-components/nav/DesktopUserAreaClient";
import { DesktopNavLinks } from "@/app/layout-components/nav/NavLinksClient";
import { NotificationsBell } from "@/app/layout-components/notifications/NotificationsBell";

interface TopNavDesktopProps {
  favoritesCount?: number;
}

export function TopNavDesktop({ favoritesCount }: TopNavDesktopProps) {
  return (
    <div className="hidden md:grid md:grid-cols-[1fr_4.5fr_1fr] h-14 items-center gap-4 px-4">
      <div className="flex items-center gap-2 flex-1">
        <LogoNav />
      </div>
      <DesktopNavLinks favoritesCount={favoritesCount} />
      <div className="flex items-center justify-end gap-3">
        <NotificationsBell />
        <DesktopUserAreaClient />
      </div>
    </div>
  );
}

