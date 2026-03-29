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
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />
      <MobileSidebar
        clientName={clientName}
        pendingArticlesCount={pendingArticlesCount}
        subscribersCount={subscribersCount}
        leadsCount={leadsCount}
        isOpen={isMobileOpen}
        onOpenChange={setIsMobileOpen}
      />
      <div
        className={cn(
          "flex h-screen flex-col overflow-hidden transition-[padding] duration-300",
          isSidebarCollapsed ? "lg:ps-16" : "lg:ps-64"
        )}
      >
        <header className="sticky top-0 z-50 shrink-0">
          <DashboardHeader
            onMenuClick={() => setIsMobileOpen(true)}
            pendingCommentsCount={pendingCommentsCount}
            pendingQuestionsCount={pendingQuestionsCount}
            pendingSupportCount={pendingSupportCount}
          />
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto container mx-auto max-w-[1128px] px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
