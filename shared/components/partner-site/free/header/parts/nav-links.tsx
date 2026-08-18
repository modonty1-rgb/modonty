import { cn } from "../../../../../lib/utils/index";
import type { HeaderNavLink } from "../header-data";

interface NavLinksProps {
  links: HeaderNavLink[];
  /** Which href is the current page (foreground colour); others read muted. */
  currentHref?: string;
  light?: boolean;
  className?: string;
  gap?: "gap-8" | "gap-10";
}

/** 14px medium links, 32px apart — the convention shared by mainstream header templates. */
export function NavLinks({ links, currentHref, light = false, className, gap = "gap-8" }: NavLinksProps) {
  const current = currentHref ?? links[0]?.href;
  return (
    <ul className={cn("flex items-center text-sm font-medium", gap, className)}>
      {links.map((l) => {
        const isCurrent = l.href === current;
        return (
          <li key={l.href}>
            <a
              href={l.href}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "transition-colors",
                isCurrent
                  ? light ? "text-white" : "text-foreground"
                  : light ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
