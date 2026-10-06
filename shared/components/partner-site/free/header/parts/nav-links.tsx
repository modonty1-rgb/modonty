"use client";

import { SiteLink } from "../../../parts/site-link";
import { cn } from "../../../../../lib/utils/index";
import { useCurrentNavHref } from "./use-current-nav-href";
import type { HeaderNavLink } from "../header-data";

interface NavLinksProps {
  links: HeaderNavLink[];
  /** Which href is the current page (foreground colour); others read muted. */
  currentHref?: string;
  light?: boolean;
  className?: string;
  gap?: "gap-8" | "gap-10";
}

/**
 * 14px medium links, 32px apart — the convention shared by mainstream header templates.
 *
 * الصفحة الحالية تُعرف من المسار لا من الترتيب: كان `links[0]` يُعتبر الحالي دائماً،
 * فتُضاء «الرئيسية» في كل صفحة (مقيس على `/photos` · ٣١ أغسطس).
 */
export function NavLinks({ links, currentHref, light = false, className, gap = "gap-8" }: NavLinksProps) {
  const active = useCurrentNavHref(links);
  const current = currentHref ?? active;
  return (
    // A bare <ul> — screen readers had no «navigation» landmark to jump to (4 Oct 2026).
    <nav aria-label="صفحات الموقع" className={className}>
    <ul className={cn("flex items-center text-sm font-medium", gap)}>
      {links.map((l) => {
        const isCurrent = l.href === current;
        return (
          <li key={l.href}>
            <SiteLink
              href={l.href}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "whitespace-nowrap transition-colors",
                isCurrent
                  ? light ? "text-white" : "text-foreground"
                  : light ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </SiteLink>
          </li>
        );
      })}
    </ul>
    </nav>
  );
}
