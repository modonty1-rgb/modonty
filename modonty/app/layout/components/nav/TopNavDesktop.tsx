import { Suspense } from "react";
import { LogoNav } from "@/app/layout/components/nav/LogoNav";
import { DesktopUserAreaClient } from "@/app/layout/components/nav/DesktopUserAreaClient";
import { DesktopNavLinks, DesktopNavList } from "@/app/layout/components/nav/NavLinksClient";
import { NotificationsBell } from "@/app/layout/components/notifications/NotificationsBell";
import { ThemeToggle } from "@/app/layout/components/nav/ThemeToggle";

export function TopNavDesktop() {
  return (
    <div className="hidden md:grid md:grid-cols-[1fr_4.5fr_1fr] h-14 items-center gap-4 px-4">
      <div className="flex items-center gap-2 flex-1">
        <LogoNav />
      </div>
      {/* Active mark reads the pathname → own boundary on dynamic routes (/page/n,
          /tags/x); the fallback is the same links, unmarked, so the shell keeps them. */}
      <Suspense fallback={<DesktopNavList pathname={null} />}>
        <DesktopNavLinks />
      </Suspense>
      <div className="flex items-center justify-end gap-3">
        <ThemeToggle />
        {/* Reads the session → streams behind its own boundary; the fallback holds the
            bell's 44px slot so the avatar doesn't slide when it lands. */}
        <Suspense fallback={<span className="inline-block h-11 w-11" aria-hidden />}>
          <NotificationsBell />
        </Suspense>
        <DesktopUserAreaClient />
      </div>
    </div>
  );
}
