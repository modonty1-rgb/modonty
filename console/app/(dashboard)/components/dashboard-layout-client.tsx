"use client";

import { useState } from "react";
import { DashboardHeader } from "./dashboard-header";
import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";

interface DashboardLayoutClientProps {
  clientName: string;
  pendingArticlesCount: number;
  pendingCommentsCount: number;
  children: React.ReactNode;
}

export function DashboardLayoutClient({
  clientName,
  pendingArticlesCount,
  pendingCommentsCount,
  children,
}: DashboardLayoutClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        clientName={clientName}
        pendingArticlesCount={pendingArticlesCount}
        pendingCommentsCount={pendingCommentsCount}
      />
      <MobileSidebar
        clientName={clientName}
        pendingArticlesCount={pendingArticlesCount}
        pendingCommentsCount={pendingCommentsCount}
        isOpen={isMobileOpen}
        onOpenChange={setIsMobileOpen}
      />
      <div className="lg:pl-64">
        <DashboardHeader
          clientName={clientName}
          onMenuClick={() => setIsMobileOpen(true)}
        />
        <main className="container mx-auto max-w-[1128px] px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
