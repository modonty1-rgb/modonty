"use client";

import { OptimizedImage, asMedia } from "@modonty/database/components/optimized-image";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ar } from "@/lib/ar";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav";
import { SidebarGroups } from "./sidebar-groups";
import { buildNavGroups, buildPinnedNavItems, SITE_HEALTH_ITEM } from "./nav-config";
import { PublicPageLink } from "./public-page-link";
import { SidebarSubscription } from "./sidebar-subscription";
import { SidebarIconLink } from "./sidebar-icon-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { SidebarSubscriptionProps } from "./sidebar-subscription";

interface MobileSidebarProps {
  clientName: string;
  clientLogoUrl: string | null;
  pendingArticlesCount: number;
  subscribersCount: number;
  leadsCount: number;
  newBookingsCount: number;
  pendingFaqsCount: number;
  pendingPageFaqsCount: number;
  pendingClientCommentsCount: number;
  pendingClientReviewsCount: number;
  galleryCount: number;
  reelsCount: number;
  videosCount: number;
  isYmyl: boolean;
  ymylComplete: boolean;
  publicPageUrl: string | null;
  subscription: Omit<SidebarSubscriptionProps, "isCollapsed">;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({
  clientName,
  clientLogoUrl,
  pendingArticlesCount,
  subscribersCount,
  leadsCount,
  newBookingsCount,
  pendingFaqsCount,
  pendingPageFaqsCount,
  pendingClientCommentsCount,
  pendingClientReviewsCount,
  galleryCount,
  reelsCount,
  videosCount,
  isYmyl,
  ymylComplete,
  publicPageUrl,
  subscription,
  isOpen,
  onOpenChange,
}: MobileSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  const navCounts = {
    pendingArticlesCount,
    subscribersCount,
    leadsCount,
    newBookingsCount,
    pendingFaqsCount,
    pendingPageFaqsCount,
    pendingClientCommentsCount,
    pendingClientReviewsCount,
    galleryCount,
    reelsCount,
    videosCount,
    isYmyl,
    ymylComplete,
  };
  const pinnedItems = buildPinnedNavItems(navCounts);
  const navGroups = buildNavGroups(navCounts);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-64 flex-col p-0">
        <SheetHeader className="border-b border-border p-4">
          {/* The name is the way back to the dashboard on phones — the header's own
              dashboard link is `hidden sm:inline-block`, so without this there is none. */}
          <SheetTitle asChild>
            <Link href="/dashboard" className="flex items-start gap-2 text-start">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 text-primary shadow-sm">
              {clientLogoUrl ? (
                <OptimizedImage
                  media={asMedia(clientLogoUrl, clientName)}
                  alt={clientName}
                  width={36}
                  height={36}
                  sizes="36px"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {clientName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
              <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground break-words">
                {clientName}
              </span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Same row as the desktop rail — the public link must be one tap away on phones
            too, since that is where clients actually copy it from. */}
        <div className="border-b border-border px-3 py-2.5">
          <PublicPageLink url={publicPageUrl} variant="sidebar" />
        </div>

        {/* Same reason as the desktop rail: never below a scrolling list. */}
        <SidebarSubscription {...subscription} />

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 space-y-0.5 border-b border-border pb-2">
            {pinnedItems.map((item) => (
              <SidebarNavItem key={item.href} {...item} isCollapsed={false} />
            ))}
          </div>

          <SidebarGroups groups={navGroups} />
        </nav>

        {/* Same foot as the desktop rail: icons for the two utilities, a worded button for
            sign out. The dashboard is one tap away on the client name above. */}
        <div className="flex items-center gap-1 border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/signed-out" })}
            className="flex-1 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="ms-2">{ar.nav.signOut}</span>
          </Button>
          <SidebarIconLink href="/dashboard/settings" icon={Settings} label={ar.nav.settings} />
          <SidebarIconLink
            href={SITE_HEALTH_ITEM.href}
            icon={SITE_HEALTH_ITEM.icon}
            label={SITE_HEALTH_ITEM.label}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
