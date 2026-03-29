import { ChatSheetContainer } from "@/components/chatbot/ChatSheetContainer";
import { TopNavDesktop } from "./TopNavDesktop";
import { LogoNav } from "@/components/navigatore/LogoNav";
import { SearchLink } from "@/components/navigatore/SearchLink";
import { ChatTriggerButton } from "@/components/chatbot/ChatTriggerButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";

export type NavSection = "home" | "trending" | "categories" | "clients" | "none";

interface TopNavProps {
  activeSection: NavSection;
  favoritesCount?: number;
}

export function TopNav({ activeSection, favoritesCount }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-card/90 shadow-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:text-sm font-medium"
      >
        تخطى إلى المحتوى الرئيسي
      </a>
      <div className="container mx-auto max-w-[1128px]">
        {/* Mobile Layout: 3 columns (logo / search / actions) */}
        <div className="grid md:hidden h-14 grid-cols-[auto,1fr,auto] items-center gap-3 px-4">
          <LogoNav />
          <SearchLink variant="compact" className="w-full" />
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <ChatTriggerButton variant="nav" />
            <UserMenu />
          </div>
        </div>

        {/* Desktop Layout */}
        <TopNavDesktop activeSection={activeSection} favoritesCount={favoritesCount} />
      </div>
      <ChatSheetContainer />
    </header>
  );
}

