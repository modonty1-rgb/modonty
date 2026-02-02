"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  FileEdit,
  BarChart3,
  Settings,
  HelpCircle,
  Image,
  TrendingUp,
  MessageSquare,
  Users,
  Target,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  clientName: string;
  pendingArticlesCount: number;
  pendingCommentsCount: number;
}

export function Sidebar({ clientName, pendingArticlesCount, pendingCommentsCount }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300",
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
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <SidebarNavItem
          href="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/articles"
          icon={FileText}
          label="Articles"
          badge={pendingArticlesCount}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/content"
          icon={FileEdit}
          label="Content"
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/media"
          icon={Image}
          label="Media"
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/analytics"
          icon={BarChart3}
          label="Analytics"
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/campaigns"
          icon={TrendingUp}
          label="Campaigns"
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/comments"
          icon={MessageSquare}
          label="Comments"
          badge={pendingCommentsCount}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/subscribers"
          icon={Users}
          label="Subscribers"
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/leads"
          icon={Target}
          label="Leads"
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/settings"
          icon={Settings}
          label="Settings"
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          href="/dashboard/support"
          icon={HelpCircle}
          label="Support"
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
          {!isCollapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </div>
    </aside>
  );
}
