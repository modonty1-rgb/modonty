"use client";

import { useState } from "react";
import { DashboardHeader } from "./dashboard-header";
import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutClientProps {
  clientName: string;
  pendingArticlesCount: number;
  pendingCommentsCount: number;
  pendingQuestionsCount: number;
  subscribersCount: number;
  leadsCount: number;
  pendingSupportCount: number;
  pendingFaqsCount: number;
  children: React.ReactNode;
}

export function DashboardLayoutClient({
  clientName,
  pendingArticlesCount,
  pendingCommentsCount,
  pendingQuestionsCount,
  subscribersCount,
  leadsCount,
  pendingSupportCount,
  pendingFaqsCount,
  children,
}: DashboardLayoutClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        clientName={clientName}
        pendingArticlesCount={pendingArticlesCount}
        subscribersCount={subscribersCount}
        leadsCount={leadsCount}
        pendingFaqsCount={pendingFaqsCount}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />
      <MobileSidebar
        clientName={clientName}
        pendingArticlesCount={pendingArticlesCount}
        subscribersCount={subscribersCount}
        leadsCount={leadsCount}
        pendingFaqsCount={pendingFaqsCount}
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
