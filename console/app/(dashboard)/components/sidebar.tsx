"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ar } from "@/lib/ar";
import {
  FileText,
  FileEdit,
  HelpCircle,
  Image,
  TrendingUp,
  Users,
  Target,
  ChevronLeft,
  LogOut,
  Building2,
  ClipboardList,
} from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  clientName: string;
  pendingArticlesCount: number;
  subscribersCount: number;
  leadsCount: number;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({
  clientName,
  pendingArticlesCount,
  subscribersCount,
  leadsCount,
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
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        <Link
          href="/dashboard"
          className={cn(
            "font-semibold text-foreground transition-opacity hover:opacity-80",
            isCollapsed && "hidden"
          )}
        >
          Modonty
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!isCollapsed)}
          className="h-8 w-8"
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

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <SidebarNavItem
          href="/dashboard/profile"
          icon={Building2}
          label={ar.nav.profile}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/seo"
          icon={ClipboardList}
          label={ar.nav.seo}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/articles"
          icon={FileText}
          label={ar.nav.articles}
          badge={pendingArticlesCount}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/content"
          icon={FileEdit}
          label={ar.nav.content}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/media"
          icon={Image}
          label={ar.nav.media}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/campaigns"
          icon={TrendingUp}
          label={ar.nav.campaigns}
          badgeLabel={ar.campaigns.beta}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/subscribers"
          icon={Users}
          label={ar.nav.subscribers}
          badge={subscribersCount}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/leads"
          icon={Target}
          label={ar.nav.leads}
          badge={leadsCount}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/support"
          icon={HelpCircle}
          label={ar.nav.support}
          isCollapsed={isCollapsed}
        />
      </nav>

      <div className="border-t border-border p-3">
        <div
          className={cn(
            "mb-2 flex items-center gap-3 px-3 py-2",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-xs font-semibold">
              {clientName.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {clientName}
              </p>
            </div>
          )}
        </div>
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
