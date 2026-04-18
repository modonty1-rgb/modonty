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
        "relative flex flex-col items-center justify-center px-3 py-1.5 text-xs transition-colors duration-150 h-14 border-b-2 hover:text-primary hover:bg-muted/50",
        active
          ? "text-primary border-primary bg-primary/[0.07]"
          : "text-muted-foreground border-transparent",
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

