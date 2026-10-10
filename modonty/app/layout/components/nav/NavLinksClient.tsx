"use client";

import { usePathname } from "next/navigation";
import { SearchLink, type SearchLinkLabels } from "@/app/layout/components/nav/SearchLink";
import { NavCapsuleItem } from "@/components/shared/nav-capsule/NavCapsuleItem";
import { mainNavItemDefs as mainNavItems, type MainNavLabelKey } from "@/app/layout/helpers/nav-items";
import { getNavSectionPath } from "@/lib/nav/get-nav-section-path";

function activeIndexFor(rawPathname: string | null): number {
  if (rawPathname === null) return 0;
  // A page without its own tab takes its parent section's (`/quran` → مدونتي).
  const pathname = getNavSectionPath(rawPathname);
  // Home matches the exact root only; others match their path prefix (e.g. /clients/[slug]).
  const i = mainNavItems.findIndex((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)));
  return Math.max(0, i);
}

/**
 * **الشريط كبسولةٌ واحدة — مثل تطبيق الجوّال** (خالد ٩ أكتوبر ٢٠٢٦: «الدوائر في الناف بار جداً
 * سيئة»). حاويةٌ بارتفاع ٥٦ وحشو ٤ على سطح البطاقة (`muted` في الداكن) بظلٍّ خفيف، والترتيبُ
 * ثابتٌ من اليمين — الرئيسية أوّلاً — بلا الحلقة الدوّارة السابقة: النشطُ حبّةٌ ممتلئة تتمدّد في
 * مكانها، والباقي أيقوناتٌ فقط. نظام التصميم ١٫٠ في Claude Design · Components 01.
 */
export function DesktopNavList({ pathname, labels }: { pathname: string | null; labels: { mainNav: string; menuItems: Record<MainNavLabelKey, string> } & SearchLinkLabels }) {
  const activeIndex = activeIndexFor(pathname);
  return (
    <div className="flex items-center justify-center gap-3">
      <SearchLink labels={labels} />
      <nav aria-label={labels.mainNav} className="flex h-14 shrink-0 items-center gap-0.5 rounded-full bg-card p-1 shadow-[0_2px_8px_hsl(var(--foreground)/0.08)] ring-1 ring-border/60 dark:bg-muted">
        {mainNavItems.map((item, index) => (
          <NavCapsuleItem
            key={item.href}
            icon={item.icon}
            activeIcon={item.activeIcon}
            label={labels.menuItems[item.labelKey]}
            href={item.href}
            active={pathname !== null && index === activeIndex}
            tone={item.tone}
            tooltip
          />
        ))}
      </nav>
    </div>
  );
}

// `usePathname` on a route with a dynamic param needs a Suspense boundary under
// cacheComponents (use-pathname.md, "Good to know") — the caller wraps this and uses
// <DesktopNavList pathname={null} /> as the fallback.
export function DesktopNavLinks({ labels }: { labels: { mainNav: string; menuItems: Record<MainNavLabelKey, string> } & SearchLinkLabels }) {
  const pathname = usePathname();
  return <DesktopNavList pathname={pathname} labels={labels} />;
}
