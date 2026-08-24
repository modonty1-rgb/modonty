import type { ComponentType } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DesktopNavItemProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
  tone?: "accent";
}

export function DesktopNavItem({ icon: Icon, label, href, active = false, tone }: DesktopNavItemProps) {
  return (
    <Link
      href={href}
      // The active item is marked by colour and a bottom border only, which a screen reader cannot
      // perceive. `aria-current="page"` is what announces "you are here" — same attribute MobileMenu
      // already carries, so the two navs now behave alike.
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex flex-col items-center justify-center px-3 py-1.5 text-xs transition-colors duration-150 h-14 border-b-2 hover:text-link hover:bg-muted/50",
        active
          ? "text-link border-primary bg-primary/[0.07]"
          : tone === "accent"
            ? "text-link-accent border-transparent"
            : "text-muted-foreground border-transparent",
      )}
    >
      <span className="relative inline-flex">
        <Icon className="h-4 w-4" />
      </span>
      <span className="mt-0.5">{label}</span>
    </Link>
  );
}

