import Link from "@/components/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  icon?: LucideIcon;
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
        "flex items-center gap-3 transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-primary",
        className
      )}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{label}</span>
    </Link>
  );
}
