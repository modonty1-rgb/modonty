"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings, LayoutDashboard, BarChart3, HelpCircle, MessageSquare, Bell } from "lucide-react";
import { ar } from "@/lib/ar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  pendingCommentsCount?: number;
  pendingQuestionsCount?: number;
  pendingSupportCount?: number;
}

const routeLabels: Record<string, string> = {
  "/dashboard": ar.nav.dashboard,
  "/dashboard/profile": ar.nav.profile,
  "/dashboard/seo": ar.nav.seo,
  "/dashboard/articles": ar.nav.articles,
  "/dashboard/content": ar.nav.content,
  "/dashboard/media": ar.nav.media,
  "/dashboard/analytics": ar.nav.analytics,
  "/dashboard/campaigns": ar.nav.campaigns,
  "/dashboard/comments": ar.nav.comments,
  "/dashboard/questions": ar.nav.questions,
  "/dashboard/subscribers": ar.nav.subscribers,
  "/dashboard/leads": ar.nav.leads,
  "/dashboard/settings": ar.nav.settings,
  "/dashboard/support": ar.nav.support,
};

function getNavTitle(pathname: string): string {
  const base = pathname.replace(/\/$/, "") || "/dashboard";
  if (routeLabels[base]) return routeLabels[base];
  // Try parent paths (e.g., /dashboard/seo/intake → /dashboard/seo)
  const segments = base.split("/");
  while (segments.length > 1) {
    segments.pop();
    const parent = segments.join("/");
    if (routeLabels[parent]) return routeLabels[parent];
  }
  return ar.nav.dashboard;
}

export function DashboardHeader({
  onMenuClick,
  pendingCommentsCount = 0,
  pendingQuestionsCount = 0,
  pendingSupportCount = 0,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const navTitle = getNavTitle(pathname);
  const isAnalytics = pathname === "/dashboard/analytics";
  const isComments = pathname === "/dashboard/comments";
  const isQuestions = pathname === "/dashboard/questions";
  const isSupport = pathname === "/dashboard/support";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <nav className="flex h-14 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6" aria-label="Main">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label={ar.header.openMenu}
            className="lg:hidden shrink-0 h-10 w-10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link
            href="/dashboard"
            className="hidden sm:inline-block text-lg font-semibold text-foreground shrink-0 hover:opacity-80"
          >
            Modonty
          </Link>
          <span className="hidden text-muted-foreground sm:inline" aria-hidden>
            /
          </span>
          <Link
            href="/dashboard"
            className="hidden sm:inline-block truncate text-sm font-medium text-foreground hover:opacity-80 underline-offset-4 hover:underline"
          >
            {ar.nav.dashboard}
          </Link>
          {pathname !== "/dashboard" && pathname !== "/dashboard/" && (
            <>
              <span className="hidden text-muted-foreground sm:inline" aria-hidden>
                /
              </span>
              <span className="truncate text-sm font-medium text-foreground">
                {navTitle}
              </span>
            </>
          )}
          {(pathname === "/dashboard" || pathname === "/dashboard/") && (
            <span className="sm:hidden truncate text-base font-semibold text-foreground">
              {ar.nav.dashboard}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Link href="/dashboard" title={ar.nav.dashboard} className="hidden sm:inline-block">
            <Button type="button" variant="ghost" size="icon" className="h-10 w-10">
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/analytics" title={ar.nav.analytics}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10", isAnalytics && "bg-primary/10 text-primary")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </Link>
          <Link
            href="/dashboard/comments"
            title={ar.nav.comments}
            className="relative inline-flex"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10", isComments && "bg-primary/10 text-primary")}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            {pendingCommentsCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold leading-none text-destructive-foreground tabular-nums">
                {pendingCommentsCount > 9 ? "9+" : pendingCommentsCount}
              </span>
            )}
          </Link>
          <Link
            href="/dashboard/questions"
            title={ar.nav.questions}
            className="relative inline-flex"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10", isQuestions && "bg-primary/10 text-primary")}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            {pendingQuestionsCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold leading-none text-destructive-foreground tabular-nums">
                {pendingQuestionsCount > 9 ? "9+" : pendingQuestionsCount}
              </span>
            )}
          </Link>
          <Link
            href="/dashboard/support"
            title={ar.nav.support}
            className="relative inline-flex"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10", isSupport && "bg-primary/10 text-primary")}
            >
              <Bell className="h-4 w-4" />
            </Button>
            {pendingSupportCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold leading-none text-destructive-foreground tabular-nums">
                {pendingSupportCount > 9 ? "9+" : pendingSupportCount}
              </span>
            )}
          </Link>
          <Link href="/dashboard/settings" title={ar.nav.settings} className="hidden sm:inline-block">
            <Button type="button" variant="ghost" size="icon" className="h-10 w-10">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
