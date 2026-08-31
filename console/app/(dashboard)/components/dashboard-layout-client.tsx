"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "./dashboard-header";
import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { FirstTimeWelcome } from "./first-time-welcome";
import { cn } from "@/lib/utils";

import type { SidebarSubscriptionProps } from "./sidebar-subscription";

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
  galleryCount: number;
  reelsCount: number;
  videosCount: number;
  isYmyl: boolean;
  ymylComplete: boolean;
  publicPageUrl: string | null;
  /** Plan block pinned in the sidebar foot, derived on the server. */
  subscription: Omit<SidebarSubscriptionProps, "isCollapsed">;
  /** Account state notice — rendered above every page, or nothing when all is settled. */
  accountNotice?: React.ReactNode;
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
  galleryCount,
  reelsCount,
  videosCount,
  isYmyl,
  ymylComplete,
  publicPageUrl,
  subscription,
  accountNotice,
  children,
}: DashboardLayoutClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isWide = usePathname()?.startsWith("/dashboard/my-site") ?? false;

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
        galleryCount={galleryCount}
        reelsCount={reelsCount}
        videosCount={videosCount}
        isYmyl={isYmyl}
        ymylComplete={ymylComplete}
        publicPageUrl={publicPageUrl}
        subscription={subscription}
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
        galleryCount={galleryCount}
        reelsCount={reelsCount}
        videosCount={videosCount}
        isYmyl={isYmyl}
        ymylComplete={ymylComplete}
        publicPageUrl={publicPageUrl}
        subscription={subscription}
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
        {/* «موقعي» يعرض جهازين حقيقيَّين جنب بعض (١٢٨٠ + ٣٩٠)، فحدّ ١١٢٨ يخنق الجوّال
            ويخفيه. هذه الشاشة وحدها تأخذ العرض كلّه؛ الباقي يبقى على عمود القراءة. */}
        <main className={cn("container mx-auto w-full px-4 py-8", isWide ? "max-w-none" : "max-w-[1128px]")}>
          {accountNotice && <div className="mb-6">{accountNotice}</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
