import { ChatSheetContainer } from "@/components/chatbot/ChatSheetContainer";
import { TopNavDesktop } from "./TopNavDesktop";
import { LogoNav } from "@/components/navigatore/LogoNav";
import { SearchLink } from "@/components/navigatore/SearchLink";
import { ChatTriggerButton } from "@/components/chatbot/ChatTriggerButton";
import { UserMenu } from "@/components/auth/UserMenu";

export type NavSection = "home" | "trending" | "categories" | "clients" | "none";

interface TopNavProps {
  activeSection: NavSection;
}

export function TopNav({ activeSection }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto max-w-[1128px]">
        {/* Mobile Layout: 3 columns (logo / search / actions) */}
        <div className="grid md:hidden h-14 grid-cols-[auto,1fr,auto] items-center gap-3 px-4">
          <LogoNav />
          <SearchLink variant="compact" className="w-full" />
          <div className="flex items-center gap-2">
            <ChatTriggerButton variant="nav" />
            <UserMenu />
          </div>
        </div>

        {/* Desktop Layout */}
        <TopNavDesktop activeSection={activeSection} />
      </div>
      <ChatSheetContainer />
    </header>
  );
}

