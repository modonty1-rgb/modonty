import { Suspense } from "react";
import { messages } from "@/lib/i18n/messages";
import { LogoNav } from "@/components/shared/nav/LogoNav";
import { DesktopUserAreaClient } from "./DesktopUserAreaClient";
import { DesktopNavLinks } from "./DesktopNavLinks";
import { DesktopNavList } from "./DesktopNavList";
import { NotificationsBell } from "../notifications/NotificationsBell";
import { ThemeToggle } from "@/components/shared/nav/ThemeToggle";

export function TopNavDesktop() {
  const navLabels = {
    mainNav: messages.chrome.mainNav,
    menuItems: messages.chrome.menuItems,
    searchArticles: messages.chrome.searchArticles,
    searchPlaceholder: messages.chrome.searchPlaceholder,
  };
  return (
    <div className="hidden lg:grid lg:grid-cols-[1fr_4.5fr_1fr] h-14 items-center gap-4 px-4">
      <div className="flex items-center gap-2 flex-1">
        <LogoNav />
      </div>
      {/* Active mark reads the pathname → own boundary on dynamic routes (/page/n,
          /tags/x); the fallback is the same links, unmarked, so the shell keeps them. */}
      <Suspense fallback={<DesktopNavList labels={navLabels} pathname={null} />}>
        <DesktopNavLinks labels={navLabels} />
      </Suspense>
      <div className="flex items-center justify-end gap-3">
        <ThemeToggle labels={messages.chrome.theme} />
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
