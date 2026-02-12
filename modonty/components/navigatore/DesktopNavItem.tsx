import type { ComponentType } from "react";
import Link from "@/components/link";
import { cn } from "@/lib/utils";

interface DesktopNavItemProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
}

export function DesktopNavItem({ icon: Icon, label, href, active = false }: DesktopNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center px-3 py-1.5 text-xs hover:text-primary transition-colors h-14",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="mt-0.5">{label}</span>
    </Link>
  );
}

