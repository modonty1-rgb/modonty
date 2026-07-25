"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  MousePointerClick,
  FileText,
  Users,
  UserPlus,
  Mail,
  Image as ImageIcon,
  Tags,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Order mirrors the page's reading order. Each id matches a <section id> in page.tsx.
const ITEMS: NavItem[] = [
  { id: "sec-today", label: "Today", icon: Sparkles },
  { id: "sec-visitors", label: "Visitors", icon: MousePointerClick },
  { id: "sec-articles", label: "Articles", icon: FileText },
  { id: "sec-clients", label: "Clients", icon: Users },
  { id: "sec-members", label: "Members", icon: UserPlus },
  { id: "sec-subscribers", label: "Subscribers", icon: Mail },
  { id: "sec-media", label: "Media", icon: ImageIcon },
  { id: "sec-reference", label: "Reference", icon: Tags },
];

/**
 * Sticky jump-bar for the dashboard (Khalid 2026-07-25: «الأقسام بدأت تكتر — أضغط على
 * القسم يوديني له»). Clicking opens a collapsed section first, then scrolls to it; the
 * active pill tracks whichever section is under the bar as you scroll.
 */
export function DashboardNav() {
  const [active, setActive] = useState<string>(ITEMS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-110px 0px -70% 0px", threshold: 0 },
    );
    ITEMS.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    // Open the section if it's collapsed, THEN scroll — after the expand re-render lands,
    // so the target's final position is measured, not its collapsed one.
    const collapsed = el.querySelector<HTMLButtonElement>("button[aria-expanded='false']");
    if (collapsed) {
      collapsed.click();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" })),
      );
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="sticky -top-4 z-30 -mx-1 overflow-x-auto rounded-xl border border-primary/30 bg-primary/10 px-1.5 py-1.5 shadow-md ring-1 ring-inset ring-primary/10 backdrop-blur-md sm:-top-6">
      <ul className="flex items-center gap-1">
        {ITEMS.map((it) => {
          const isActive = active === it.id;
          return (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => go(it.id)}
                aria-current={isActive ? "true" : undefined}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <it.icon className="h-3.5 w-3.5" />
                {it.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
