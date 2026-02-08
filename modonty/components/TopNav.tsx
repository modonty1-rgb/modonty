"use client";

import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Home, Tags, Building2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/UserMenu";
import { LoginButton } from "@/components/auth/LoginButton";
import { MobileMenu } from "@/components/MobileMenu";
import { MobileSearch } from "@/components/MobileSearch";
import { Logo } from "@/components/Logo";
import { ChatTrigger } from "@/components/chatbot/ChatTrigger";

export function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto max-w-[1128px]">
        {/* Mobile Layout */}
        <div className="flex md:hidden h-14 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3 flex-1">
            <Logo size="header" />
          </div>
          <div className="flex items-center gap-2">
            <MobileSearch />
            {session?.user ? (
              <UserMenu />
            ) : (
              <LoginButton />
            )}
            <MobileMenu />
          </div>
        </div>

        {/* Desktop 3-Column Layout: 15-70-15 */}
        <div className="hidden md:grid md:grid-cols-[1fr_4.5fr_1fr] h-14 items-center gap-4 px-4">
          {/* Column 1: Logo (~15%) */}
          <div className="flex items-center gap-2 flex-1">
            <Logo size="header" />
          </div>

          {/* Column 2: Search + Navigation (~70%) */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث"
                className="h-10 w-full rounded-md border border-input bg-background pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ caretColor: 'transparent' }}
                suppressHydrationWarning
              />
            </div>
            <nav aria-label="التنقل الرئيسي" className="flex items-center gap-0.5 flex-shrink-0">
              <NavItem icon={Home} label="الرئيسية" href="/" active={pathname === "/"} />
              <NavItem icon={TrendingUp} label="الرائجة" href="/trending" active={pathname === "/trending"} />
              <NavItem icon={Tags} label="الفئات" href="/categories" active={pathname?.startsWith("/categories")} />
              <NavItem icon={Building2} label="العملاء" href="/clients" active={pathname?.startsWith("/clients")} />
            </nav>
          </div>

          {/* Column 3: Avatar/User Menu + Chat (~15%) - Chat on left */}
          <div className="flex items-center justify-end gap-2">
            {session?.user ? (
              <UserMenu />
            ) : (
              <LoginButton />
            )}
            <ChatTrigger variant="pill" />
          </div>
        </div>
      </div>
    </header>
  );
}

function NavItem({
  icon: Icon,
  label,
  href,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center px-3 py-1.5 text-xs hover:text-primary transition-colors h-14",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="mt-0.5">{label}</span>
    </Link>
  );
}

