"use client";

import { useState } from "react";
import { DashboardHeader } from "./dashboard-header";
import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { FirstTimeWelcome } from "./first-time-welcome";
import { cn } from "@/lib/utils";

interface DashboardLayoutClientProps {
  clientName: string;
  clientLogoUrl: string | null;
  pendingArticlesCount: number;
  pendingCommentsCount: number;
  pendingQuestionsCount: number;
  subscribersCount: number;
  leadsCount: number;
  newBookingsCount: number;
  pendingSupportCount: number;
  pendingFaqsCount: number;
  pendingPageFaqsCount: number;
  pendingClientCommentsCount: number;
  pendingClientReviewsCount: number;
  isYmyl: boolean;
  children: React.ReactNode;
}

export function DashboardLayoutClient({
  clientName,
  clientLogoUrl,
  pendingArticlesCount,
  pendingCommentsCount,
  pendingQuestionsCount,
  subscribersCount,
  leadsCount,
  newBookingsCount,
  pendingSupportCount,
  pendingFaqsCount,
  pendingPageFaqsCount,
  pendingClientCommentsCount,
  pendingClientReviewsCount,
  isYmyl,
  children,
}: DashboardLayoutClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <FirstTimeWelcome />
      <Sidebar
        clientName={clientName}
        clientLogoUrl={clientLogoUrl}
        pendingArticlesCount={pendingArticlesCount}
        subscribersCount={subscribersCount}
        leadsCount={leadsCount}
        newBookingsCount={newBookingsCount}
        pendingFaqsCount={pendingFaqsCount}
        pendingPageFaqsCount={pendingPageFaqsCount}
        pendingClientCommentsCount={pendingClientCommentsCount}
        pendingClientReviewsCount={pendingClientReviewsCount}
        isYmyl={isYmyl}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />
      <MobileSidebar
        clientName={clientName}
        clientLogoUrl={clientLogoUrl}
        pendingArticlesCount={pendingArticlesCount}
        subscribersCount={subscribersCount}
        leadsCount={leadsCount}
        newBookingsCount={newBookingsCount}
        pendingFaqsCount={pendingFaqsCount}
        pendingPageFaqsCount={pendingPageFaqsCount}
        pendingClientCommentsCount={pendingClientCommentsCount}
        pendingClientReviewsCount={pendingClientReviewsCount}
        isYmyl={isYmyl}
        isOpen={isMobileOpen}
        onOpenChange={setIsMobileOpen}
      />
      <div
        className={cn(
          "flex flex-col transition-[padding] duration-300",
          isSidebarCollapsed ? "lg:ps-16" : "lg:ps-64"
        )}
      >
        <DashboardHeader
          onMenuClick={() => setIsMobileOpen(true)}
          pendingCommentsCount={pendingCommentsCount}
          pendingQuestionsCount={pendingQuestionsCount}
          pendingSupportCount={pendingSupportCount}
        />
        <main className="container mx-auto w-full max-w-[1128px] px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
