"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ar } from "@/lib/ar";
import {
  Newspaper,
  PenLine,
  Images,
  Megaphone,
  Mail,
  UserPlus,
  LogOut,
  Building2,
  Sparkles,
  HelpCircle,
  Quote,
  Activity,
} from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileSidebarProps {
  clientName: string;
  clientLogoUrl: string | null;
  pendingArticlesCount: number;
  subscribersCount: number;
  leadsCount: number;
  pendingFaqsCount: number;
  pendingClientCommentsCount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({
  clientName,
  clientLogoUrl,
  pendingArticlesCount,
  subscribersCount,
  leadsCount,
  pendingFaqsCount,
  pendingClientCommentsCount,
  isOpen,
  onOpenChange,
}: MobileSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-64 p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2 text-start">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 text-primary shadow-sm">
              {clientLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={clientLogoUrl} alt={clientName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold">
                  {clientName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="truncate text-sm font-semibold text-foreground">{clientName}</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <SidebarNavItem
            href="/dashboard/profile"
            icon={Building2}
            label={ar.nav.profile}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/seo"
            icon={Sparkles}
            label={ar.nav.seo}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/articles"
            icon={Newspaper}
            label={ar.nav.articles}
            badge={pendingArticlesCount}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/content"
            icon={PenLine}
            label={ar.nav.content}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/media"
            icon={Images}
            label={ar.nav.media}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/campaigns"
            icon={Megaphone}
            label={ar.nav.campaigns}
            badgeLabel={ar.campaigns.beta}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/subscribers"
            icon={Mail}
            label={ar.nav.subscribers}
            badge={subscribersCount}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/leads"
            icon={UserPlus}
            label={ar.nav.leads}
            badge={leadsCount}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/faqs"
            icon={HelpCircle}
            label={ar.nav.faqs}
            badge={pendingFaqsCount}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/client-comments"
            icon={Quote}
            label={ar.nav.clientComments}
            badge={pendingClientCommentsCount}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/site-health"
            icon={Activity}
            label={ar.nav.siteHealth}
            isCollapsed={false}
          />
        </nav>

        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="ms-2">{ar.nav.signOut}</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
