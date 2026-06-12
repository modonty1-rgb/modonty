"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { IconList } from "@/lib/icons";
import { cn } from "@/lib/utils";

import type { SectionItem } from "./client-section-items";

interface ClientSectionMenuProps {
  items: SectionItem[];
}

// Lead-pill priority: the most decision-driving sections first. The top 3 that
// are present become visible tabs; everything else goes under «☰ المزيد».
const LEAD_PRIORITY = [
  "services",
  "articles",
  "reviews",
  "gallery",
  "faq",
  "overview",
  "results",
  "team",
  "about",
  "discussions",
  "contact",
  "trust",
  "hours",
  "newsletter",
];

const LEAD_COUNT = 3;

/**
 * Mobile section nav (lg:hidden): the top-priority sections as sticky tabs plus a
 * «☰ المزيد» dropdown for the rest, with one shared IntersectionObserver scroll-spy.
 * Desktop uses ClientSectionNav instead. Pure client island — the page tree stays
 * server-rendered; this adds no new client boundary.
 */
export function ClientSectionMenu({ items }: ClientSectionMenuProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Split into lead tabs (top-3 by priority, kept in scroll order) + the rest.
  const { lead, rest } = useMemo(() => {
    const rank = (id: string) => {
      const i = LEAD_PRIORITY.indexOf(id);
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    const leadIds = new Set(
      [...items]
        .sort((a, b) => rank(a.id) - rank(b.id))
        .slice(0, LEAD_COUNT)
        .map((i) => i.id)
    );
    return {
      lead: items.filter((i) => leadIds.has(i.id)),
      rest: items.filter((i) => !leadIds.has(i.id)),
    };
  }, [items]);

  // Shared scroll-spy over every present section anchor.
  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-44% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  // Close the dropdown on any outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [menuOpen]);

  if (items.length === 0) return null;

  const leadIds = new Set(lead.map((i) => i.id));
  // Burger highlights when the active section lives inside it. «overview» stays
  // neutral — you're at the top, nothing to flag.
  const restActive = activeId != null && activeId !== "overview" && !leadIds.has(activeId);

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
    setMenuOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      className="sticky top-[57px] z-[5] border-y border-border bg-background/95 backdrop-blur lg:hidden"
    >
      <div className="flex items-center gap-1.5 px-3 py-2">
        {lead.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-2 text-[13px] font-bold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-primary/[0.08] text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.short ?? item.label}
            </button>
          );
        })}

        {rest.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="المزيد من الأقسام"
            className={cn(
              "ms-auto inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-[13px] font-bold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              restActive || menuOpen
                ? "bg-primary/[0.08] text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <IconList className="h-4 w-4" aria-hidden />
            المزيد
          </button>
        )}
      </div>

      {menuOpen && rest.length > 0 && (
        <nav
          aria-label="أقسام إضافية"
          className="absolute end-3 top-full z-[6] mt-1 flex w-[210px] flex-col gap-0.5 rounded-xl border border-border bg-card p-1.5 shadow-lg"
        >
          {rest.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(item.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-[13px] font-bold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "bg-primary/[0.08] text-primary" : "text-foreground hover:bg-muted"
                )}
              >
                {item.icon && (
                  <span className="w-[18px] text-center text-[14px]" aria-hidden>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
