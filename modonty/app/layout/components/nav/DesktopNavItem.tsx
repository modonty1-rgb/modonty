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
      aria-label={label}
      title={active ? undefined : label}
      className={cn(
        "group relative grid h-14 w-12 shrink-0 place-items-center rounded-lg border-b-2 p-0 transition-colors duration-150 hover:bg-muted/50 hover:text-link",
        active
          ? "grid-rows-[24px_12px] content-center gap-1 text-link border-primary bg-primary/[0.07]"
          : tone === "accent"
            ? "text-link-accent border-transparent"
            : "text-muted-foreground border-transparent",
      )}
      >
      <Icon className={cn("h-6 w-6", active && "self-end")} />
      {active && <span className="self-start text-[11px] font-semibold leading-none">{label}</span>}
      {!active && (
        <span role="tooltip" className="pointer-events-none absolute left-1/2 top-[calc(100%+0.35rem)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/70 bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          {label}
        </span>
      )}
    </Link>
  );
}

