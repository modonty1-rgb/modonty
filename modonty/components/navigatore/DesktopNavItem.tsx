import type { ComponentType } from "react";
import Link from "@/components/link";
import { cn } from "@/lib/utils";

interface DesktopNavItemProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}

export function DesktopNavItem({ icon: Icon, label, href, active = false, badge }: DesktopNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-col items-center justify-center px-3 py-1.5 text-xs hover:text-primary transition-colors h-14",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <span className="relative inline-flex">
        <Icon className="h-4 w-4" />
        {badge !== undefined && badge > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[1rem] h-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] px-1"
            aria-label={`${badge} محفوظ`}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span className="mt-0.5">{label}</span>
    </Link>
  );
}

