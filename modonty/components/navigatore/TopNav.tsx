import { ChatSheetContainer } from "@/components/chatbot/ChatSheetContainer";
import { TopNavDesktop } from "./TopNavDesktop";
import { LogoNav } from "@/components/navigatore/LogoNav";
import { ChatTriggerButton } from "@/components/chatbot/ChatTriggerButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { ScrollProgress } from "@/components/layout/ScrollProgress";

export type NavSection = "home" | "trending" | "categories" | "clients" | "none";

interface TopNavProps {
  activeSection: NavSection;
  favoritesCount?: number;
}

export function TopNav({ activeSection, favoritesCount }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-accent/20 bg-white/95 dark:bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-card/90 shadow-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:text-sm font-medium"
      >
        تخطى إلى المحتوى الرئيسي
      </a>
      <div className="container mx-auto max-w-[1128px]">
        {/* Mobile Layout: 3 columns (logo | CTA | actions) */}
        <div className="grid md:hidden h-14 grid-cols-[auto,1fr,auto] items-center gap-2 px-4">
          {/* Col 1 — Logo */}
          <LogoNav />

          {/* Col 2 — CTA fills center column */}
          <CtaTrackedLink
            href="https://www.jbrseo.com"
            target="_blank"
            rel="noopener noreferrer"
            label="Header Mobile CTA — عملاء بلا إعلانات"
            type="BUTTON"
            className="flex items-center justify-center gap-2 w-full h-9 text-[11px] font-bold bg-accent/15 text-accent rounded-full border border-accent/30 active:scale-[0.97] transition-all hover:bg-accent/25"
            aria-label="عملاء بلا إعلانات — جبر SEO"
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            عملاء بلا إعلانات
          </CtaTrackedLink>

          {/* Col 3 — Actions */}
          <div className="flex items-center justify-end gap-1.5">
            <NotificationsBell />
            <ChatTriggerButton variant="nav" />
            <UserMenu />
          </div>
        </div>

        {/* Desktop Layout */}
        <TopNavDesktop activeSection={activeSection} favoritesCount={favoritesCount} />
      </div>
      <ChatSheetContainer />
      <ScrollProgress />
    </header>
  );
}
