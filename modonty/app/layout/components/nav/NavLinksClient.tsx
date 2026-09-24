"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SearchLink } from "@/app/layout/components/nav/SearchLink";
import { DesktopNavItem } from "@/app/layout/components/nav/DesktopNavItem";
import { mainNavItems } from "@/app/layout/helpers/nav-config";
import { getOrbitSteps } from "@/lib/nav/get-orbit-steps";

/** Distance between two slots on the ring (px) — a 44px circle plus breathing room. */
const ORBIT_GAP = 54;
/** Extra room pushed outward on both sides of the active circle, so the ring parts around it. */
const ACTIVE_CLEARANCE = 10;
/** The ring's box: every slot from the far left to the far right, plus the active clearance. */
const RING_WIDTH = (mainNavItems.length - 1) * ORBIT_GAP + 56 + ACTIVE_CLEARANCE * 2;

function activeIndexFor(pathname: string | null): number {
  if (pathname === null) return 0;
  // Home matches the exact root only; others match their path prefix (e.g. /clients/[slug]).
  const i = mainNavItems.findIndex((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)));
  return Math.max(0, i);
}

/**
 * **الشريط حلقةٌ مركزُها ثابت — مثل شريط الجوّال** (خالد ٢٤ سبتمبر ٢٠٢٦: «السنتر هو الثابت، لما
 * تختار الأيقونة بتتحرّك وتروح للسنتر — نفس فكرة الجالكسي»). مقيسٌ على الجوّال (٣٩٠): النشطُ
 * عند x=190 قبل الضغط وبعده، والباقي يدور حوله. والحسابُ نفسُه (`lib/nav/get-orbit-steps.ts`).
 *
 * كلُّ خانةٍ صندوقٌ بعرضٍ واحد (٥٦) يبدأ من المركز ويُزاح بـ`transform` — فتتحرّك الأيقوناتُ
 * بسلاسة، ولا تتغيّر أبعادُ الشريط. والقافزُ من طرفٍ إلى طرف (أكثر من خانتين) يختفي ويظهر بدل أن
 * يعبر الشريطَ كلَّه أمام العين.
 */
export function DesktopNavList({ pathname, labels }: { pathname: string | null; labels: { mainNav: string } }) {
  const activeIndex = activeIndexFor(pathname);
  const [previousActiveIndex, setPreviousActiveIndex] = useState(activeIndex);
  useEffect(() => setPreviousActiveIndex(activeIndex), [activeIndex]);
  const count = mainNavItems.length;
  const offset = (index: number, from: number) => {
    const steps = getOrbitSteps(index, from, count);
    return steps * ORBIT_GAP + Math.sign(steps) * ACTIVE_CLEARANCE;
  };

  return (
    <div className="flex items-center gap-3">
      <SearchLink />
      <nav aria-label={labels.mainNav} className="relative h-14 flex-shrink-0" style={{ width: RING_WIDTH }}>
        {mainNavItems.map((item, index) => {
          const active = pathname !== null && index === activeIndex;
          const x = offset(index, activeIndex);
          const wrapping = Math.abs(x - offset(index, previousActiveIndex)) > ORBIT_GAP * 2;
          return (
            <div
              key={item.href}
              className={`absolute start-[calc(50%-1.75rem)] top-0 flex h-14 w-14 items-center justify-center ${
                wrapping ? "transition-opacity duration-150" : "transition-[opacity,transform] duration-300 ease-out"
              }`}
              style={{ transform: `translateX(${x}px)`, opacity: wrapping ? 0 : 1 }}
            >
              <DesktopNavItem icon={item.icon} label={item.label} href={item.href} active={active} tone={item.tone} />
            </div>
          );
        })}
      </nav>
    </div>
  );
}

// `usePathname` on a route with a dynamic param needs a Suspense boundary under
// cacheComponents (use-pathname.md, "Good to know") — the caller wraps this and uses
// <DesktopNavList pathname={null} /> as the fallback.
export function DesktopNavLinks({ labels }: { labels: { mainNav: string } }) {
  const pathname = usePathname();
  return <DesktopNavList pathname={pathname} labels={labels} />;
}
