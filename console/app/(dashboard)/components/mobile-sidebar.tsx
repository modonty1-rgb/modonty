"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
  LogOut,
} from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileSidebarProps {
  clientName: string;
  pendingArticlesCount: number;
  pendingCommentsCount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({
  clientName,
  pendingArticlesCount,
  pendingCommentsCount,
  isOpen,
  onOpenChange,
}: MobileSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="text-left font-semibold text-foreground">
            Modonty
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <SidebarNavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/articles"
            icon={FileText}
            label="Articles"
            badge={pendingArticlesCount}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/content"
            icon={FileEdit}
            label="Content"
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/media"
            icon={Image}
            label="Media"
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/analytics"
            icon={BarChart3}
            label="Analytics"
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/campaigns"
            icon={TrendingUp}
            label="Campaigns"
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/comments"
            icon={MessageSquare}
            label="Comments"
            badge={pendingCommentsCount}
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/subscribers"
            icon={Users}
            label="Subscribers"
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/leads"
            icon={Target}
            label="Leads"
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/settings"
            icon={Settings}
            label="Settings"
            isCollapsed={false}
          />
          <SidebarNavItem
            href="/dashboard/support"
            icon={HelpCircle}
            label="Support"
            isCollapsed={false}
          />
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-xs font-semibold">
                {clientName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {clientName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2">Sign out</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
