"use client";

import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ar } from "@/lib/ar";
import { ChevronLeft, LogOut, Settings } from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav";
import { SidebarGroups } from "./sidebar-groups";
import { buildNavGroups, buildPinnedNavItems, SITE_HEALTH_ITEM } from "./nav-config";
import { PublicPageLink } from "./public-page-link";
import { SidebarSubscription } from "./sidebar-subscription";
import { SidebarIconLink } from "./sidebar-icon-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { SidebarSubscriptionProps } from "./sidebar-subscription";

interface SidebarProps {
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
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({
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
  isCollapsed: isCollapsedProp,
  onCollapsedChange,
}: SidebarProps) {
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(false);
  const isCollapsed = onCollapsedChange ? (isCollapsedProp ?? false) : isCollapsedInternal;

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

  function setCollapsed(value: boolean) {
    if (onCollapsedChange) {
      onCollapsedChange(value);
    } else {
      setIsCollapsedInternal(value);
    }
  }

  return (
    <aside
      className={cn(
        "fixed start-0 top-0 z-40 h-screen border-e border-border bg-card transition-all duration-300",
        "hidden lg:flex lg:flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2 border-b border-border px-3",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80"
            aria-label={clientName}
          >
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
            <span className="truncate text-sm font-semibold text-foreground">
              {clientName}
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!isCollapsed)}
          className="h-8 w-8 shrink-0"
          aria-label={isCollapsed ? ar.nav.expandSidebar : ar.nav.collapseSidebar}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform rtl:rotate-180",
              isCollapsed && "rotate-180 rtl:rotate-0"
            )}
          />
        </Button>
      </div>

      {/* Identity, not navigation — it sits with the client's name and stays put while
          the nav below scrolls. */}
      <div className={cn("border-b border-border", isCollapsed ? "px-2 py-2" : "px-2 py-2.5")}>
        <PublicPageLink url={publicPageUrl} variant="sidebar" isCollapsed={isCollapsed} />
      </div>

      {/* Above the nav, not below it (Khalid 2026-08-11): anything under a scrolling list
          can end up past the fold on a short window, and the plan is the one thing that
          must be readable the moment the menu opens. */}
      <SidebarSubscription {...subscription} isCollapsed={isCollapsed} />

      <nav className="scrollbar-sidebar flex-1 overflow-y-auto p-2">
        {/* Above the accordion and never inside it — the one screen the client opens daily. */}
        <div className="mb-2 space-y-0.5 border-b border-border pb-2">
          {pinnedItems.map((item) => (
            <SidebarNavItem key={item.href} {...item} isCollapsed={isCollapsed} />
          ))}
        </div>

        <SidebarGroups groups={navGroups} isCollapsed={isCollapsed} />
      </nav>

      {/* One fixed foot, outside the scrolling list (Khalid 2026-08-11). Settings and the
          site check are icons only: rarely opened, and two labelled rows were enough to
          put a scrollbar on the menu. Sign out keeps its word — it is the one action here
          you must not hit by accident. */}
      <div
        className={cn(
          "flex items-center gap-1 border-t border-border p-2",
          isCollapsed && "flex-col"
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/signed-out" })}
          className={cn(
            "text-destructive hover:bg-destructive/10 hover:text-destructive",
            isCollapsed ? "w-full justify-center px-0" : "flex-1 justify-start"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ms-2">{ar.nav.signOut}</span>}
        </Button>
        <SidebarIconLink href="/dashboard/settings" icon={Settings} label={ar.nav.settings} />
        <SidebarIconLink
          href={SITE_HEALTH_ITEM.href}
          icon={SITE_HEALTH_ITEM.icon}
          label={SITE_HEALTH_ITEM.label}
        />
      </div>
    </aside>
  );
}
