"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ar } from "@/lib/ar";
import {
  Newspaper,
  PenLine,
  Images,
  Megaphone,
  Mail,
  UserPlus,
  ChevronLeft,
  LogOut,
  Building2,
  Sparkles,
  HelpCircle,
  Quote,
  Activity,
} from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  clientName: string;
  clientLogoUrl: string | null;
  pendingArticlesCount: number;
  subscribersCount: number;
  leadsCount: number;
  pendingFaqsCount: number;
  pendingClientCommentsCount: number;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({
  clientName,
  clientLogoUrl,
  pendingArticlesCount,
  subscribersCount,
  leadsCount,
  pendingFaqsCount,
  pendingClientCommentsCount,
  isCollapsed: isCollapsedProp,
  onCollapsedChange,
}: SidebarProps) {
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(false);
  const isCollapsed = onCollapsedChange ? (isCollapsedProp ?? false) : isCollapsedInternal;

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
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={clientLogoUrl}
                  alt={clientName}
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

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        <SidebarNavItem
          href="/dashboard/profile"
          icon={Building2}
          label={ar.nav.profile}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/seo"
          icon={Sparkles}
          label={ar.nav.seo}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/articles"
          icon={Newspaper}
          label={ar.nav.articles}
          badge={pendingArticlesCount}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/content"
          icon={PenLine}
          label={ar.nav.content}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/media"
          icon={Images}
          label={ar.nav.media}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/campaigns"
          icon={Megaphone}
          label={ar.nav.campaigns}
          badgeLabel={ar.campaigns.beta}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/subscribers"
          icon={Mail}
          label={ar.nav.subscribers}
          badge={subscribersCount}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/leads"
          icon={UserPlus}
          label={ar.nav.leads}
          badge={leadsCount}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/faqs"
          icon={HelpCircle}
          label={ar.nav.faqs}
          badge={pendingFaqsCount}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/client-comments"
          icon={Quote}
          label={ar.nav.clientComments}
          badge={pendingClientCommentsCount}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/site-health"
          icon={Activity}
          label={ar.nav.siteHealth}
          isCollapsed={isCollapsed}
        />
      </nav>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ms-2">{ar.nav.signOut}</span>}
        </Button>
      </div>
    </aside>
  );
}
