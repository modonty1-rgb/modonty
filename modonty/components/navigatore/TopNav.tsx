import { ChatSheetContainer } from "@/components/chatbot/ChatSheetContainer";
import { TopNavDesktop } from "./TopNavDesktop";
import { LogoNav } from "@/components/navigatore/LogoNav";
import { TopNavMobileLinks } from "./TopNavMobileLinks";
import { MobileMenuClient } from "./MobileMenuClient";
import { UserMenu } from "@/components/auth/UserMenu";
interface TopNavProps {
  favoritesCount?: number;
  notificationCount?: number;
}

export function TopNav({ favoritesCount, notificationCount }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-accent/20 bg-slate-100/95 dark:bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/90 dark:supports-[backdrop-filter]:bg-card/90 shadow-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:text-sm font-medium"
      >
        تخطى إلى المحتوى الرئيسي
      </a>
      <div className="container mx-auto max-w-[1128px]">
        {/* Mobile: Logo(=home) | nav icons | actions + burger. Chat → floating bubble. */}
        <div className="flex md:hidden h-14 items-center gap-1.5 px-3">
          <LogoNav />
          <TopNavMobileLinks />
          <div className="flex shrink-0 items-center gap-0.5">
            <div className="relative">
              <UserMenu />
              {!!notificationCount && (
                <span className="pointer-events-none absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </div>
            <MobileMenuClient />
          </div>
        </div>

        {/* Desktop Layout */}
        <TopNavDesktop favoritesCount={favoritesCount} />
      </div>
      <ChatSheetContainer />
    </header>
  );
}
