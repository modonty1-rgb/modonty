"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  clientName: string;
  onMenuClick: () => void;
}

export function DashboardHeader({
  clientName,
  onMenuClick,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <span className="text-lg font-semibold text-foreground">
          Modonty
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{clientName}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
