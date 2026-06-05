import { LogoNav } from "@/components/navigatore/LogoNav";
import { DesktopUserAreaClient } from "@/components/navigatore/DesktopUserAreaClient";
import { DesktopNavLinks } from "@/components/navigatore/NavLinksClient";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";

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

