import Link from "@/components/link";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

interface NavLinkProps {
  href: string;
  icon?: ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export function NavLink({ href, icon: Icon, label, onClick, className, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 transition-colors border-b-2",
        active
          ? "text-primary border-primary transition-colors duration-150"
          : "text-muted-foreground hover:text-primary border-transparent transition-colors duration-150",
        className
      )}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{label}</span>
    </Link>
  );
}
