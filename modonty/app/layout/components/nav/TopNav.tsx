import { Suspense } from "react";
import { TopNavDesktop } from "./TopNavDesktop";
import { LogoNav } from "@/app/layout/components/nav/LogoNav";
import { MobileMenuClient } from "./MobileMenuClient";
import { SearchLink } from "@/app/layout/components/nav/SearchLink";
import { UserMenu } from "@/app/layout/components/user-menu/UserMenu";
import { MobileNotificationBadge } from "@/app/layout/components/notifications/MobileNotificationBadge";

// Static header: everything here is in the cached shell. The only request-time reads
// (unread count · notifications bell) stream into their own small boundaries, so the
// logo and links never wait for them. Measured 2026-08-15: the header used to be the
// LAST thing to arrive (3.3s after the shell in dev) because it sat behind two counters.
export function TopNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-accent/20 bg-slate-100/95 dark:bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/90 dark:supports-[backdrop-filter]:bg-card/90 shadow-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:text-sm font-medium"
      >
        تخطى إلى المحتوى الرئيسي
      </a>
      <div className="container mx-auto max-w-[1128px]">
        {/* Mobile DOM order follows the visible RTL order: logo → search → account → menu. */}
        {/* Third column `auto`: the «مزاياك هنا» label now lives INSIDE the account button
            (beside the icon), and the search column (minmax(0,2fr)) gives up the width —
            Khalid, 21 Aug: «reduce the search bar and make it beside it». */}
        <div className="grid h-14 grid-cols-[minmax(6rem,1fr)_minmax(0,2fr)_auto] items-center gap-2 px-3 md:hidden">
          <div className="w-full min-w-0 max-w-[6rem] justify-self-start">
            <LogoNav className="h-6" />
          </div>
          <SearchLink variant="compact" className="max-w-none justify-self-stretch" />
          <div className="flex shrink-0 items-center justify-self-end gap-0.5">
            <div className="relative">
              {/* Session read → own boundary (see DesktopUserAreaClient); 44px slot held. */}
              <Suspense fallback={<span className="inline-block h-11 w-11" aria-hidden />}>
                <UserMenu />
              </Suspense>
              <Suspense fallback={null}>
                <MobileNotificationBadge />
              </Suspense>
            </div>
            <MobileMenuClient />
          </div>
        </div>

        {/* Desktop Layout */}
        <TopNavDesktop />
      </div>
    </header>
  );
}
