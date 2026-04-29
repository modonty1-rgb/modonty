"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  badgeLabel?: string;
  isCollapsed?: boolean;
}

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
  badge,
  badgeLabel,
  isCollapsed = false,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        "hover:bg-muted",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground",
        isCollapsed && "justify-center relative"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badgeLabel && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary/10 text-primary border border-primary/20">
              {badgeLabel}
            </span>
          )}
          {badge !== undefined && (
            <span
              className={cn(
                "px-1.5 py-0.5 text-xs font-semibold rounded-full min-w-[1.25rem] text-center",
                badge > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </>
      )}
      {isCollapsed && badgeLabel && (
        <span
          className="absolute top-1 end-1 h-2 w-2 rounded-full bg-primary/80"
          title={badgeLabel}
        />
      )}
      {isCollapsed && badge !== undefined && !badgeLabel && (
        <span
          className={cn(
            "absolute top-1 end-1 h-2 w-2 rounded-full",
            badge > 0 ? "bg-primary" : "bg-muted"
          )}
        />
      )}
    </Link>
  );
}
