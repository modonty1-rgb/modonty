"use client";

import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
import { IntentLink } from "@/components/shared/intent-link/IntentLink";
import { NavCapsuleItem } from "@/components/shared/nav-capsule/NavCapsuleItem";
import { cn } from "@/lib/utils";
import { getNavSectionPath } from "@/lib/nav/get-nav-section-path";

import { ModontyMark } from "@/components/icons/modonty-mark";
import { ModontyHomeMark } from "@/components/icons/modonty-home-mark";
import { ModontyHomeFilledMark } from "@/components/icons/modonty-home-filled-mark";
import { ModontyArticlesMark } from "@/components/icons/modonty-articles-mark";
import { ModontyArticlesFilledMark } from "@/components/icons/modonty-articles-filled-mark";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";
import { ModontyReelsFilledMark } from "@/components/icons/modonty-reels-filled-mark";
import { ModontyIndustriesMark } from "@/components/icons/modonty-industries-mark";

interface CapsuleTab {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  activeIcon?: ComponentType<{ className?: string }>;
  /** Which section paths light this tab — a page without its own tab belongs to one of these. */
  owns: (path: string) => boolean;
}

/**
 * The phone's four tabs, same order and doors as the mobile app's capsule
 * (`modonty-mobile/src/components/navigation/TabBar.tsx`, 9 Oct 2026). Partners live inside
 * «اكتشف», audio inside the article, and مودو in the header — so they no longer take a slot.
 * «اكتشف» keeps the approved industries original even when selected: it has no Filled variant.
 */
const TABS: CapsuleTab[] = [
  { href: "/", label: "الرئيسية", icon: ModontyHomeMark, activeIcon: ModontyHomeFilledMark, owns: (p) => p === "/" || p.startsWith("/page/") },
  { href: "/articles", label: "المقالات", icon: ModontyArticlesMark, activeIcon: ModontyArticlesFilledMark, owns: (p) => ["/articles", "/trending", "/audio"].some((s) => p === s || p.startsWith(`${s}/`)) },
  { href: "/reels", label: "الطلّات", icon: ModontyReelsMark, activeIcon: ModontyReelsFilledMark, owns: (p) => p === "/reels" || p.startsWith("/reels/") },
  { href: "/industries", label: "اكتشف", icon: ModontyIndustriesMark, owns: (p) => ["/industries", "/clients"].some((s) => p === s || p.startsWith(`${s}/`)) },
];

/**
 * **كبسولة التبويب على الجوّال — مثل التطبيق** (خالد ٩ أكتوبر ٢٠٢٦: «الدوائر في الناف بار جداً
 * سيئة»). أربعةُ تبويبات في كبسولةٍ واحدة (٥٦ · حشو ٤ · سطح البطاقة، \`muted\` في الداكن)،
 * وبجانبها عند طرف النهاية جزيرةُ «مدونتي» دائرةً منفصلة Ø٥٦ بفجوة ٨ — الشعارُ نفسه لا أيقونة.
 * الجزيرةُ النشطة كحليّة (#0E065A) بحلقة تركواز ٢px والشعارُ أبيض. الترتيبُ ثابتٌ من اليمين.
 */
export function MobileNavCapsule({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const section = pathname ? getNavSectionPath(pathname) : "";
  const activeTab = TABS.findIndex((tab) => tab.owns(section));
  const islandActive = section === "/modonty" || section.startsWith("/modonty/");

  return (
    <nav aria-label="أقسام الموقع" className="pointer-events-auto mx-auto flex max-w-md items-center gap-2">
      <div className="flex h-14 flex-1 items-center justify-between rounded-full bg-card p-1 shadow-[0_2px_8px_hsl(var(--foreground)/0.08)] ring-1 ring-border/60 dark:bg-muted">
        {TABS.map((tab, index) => (
          <NavCapsuleItem key={tab.href} icon={tab.icon} activeIcon={tab.activeIcon} label={tab.label} href={tab.href} active={index === activeTab} />
        ))}
      </div>
      <IntentLink
        href="/modonty"
        aria-label={siteName}
        aria-current={islandActive ? "page" : undefined}
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          islandActive
            ? "bg-[#0E065A] text-white ring-2 ring-[#00D8D8]"
            : "bg-card text-primary shadow-[0_2px_8px_hsl(var(--foreground)/0.08)] ring-1 ring-border/60 dark:bg-muted dark:text-foreground",
        )}
      >
        <ModontyMark className="size-8" aria-hidden />
      </IntentLink>
    </nav>
  );
}
