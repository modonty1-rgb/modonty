"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import type { SectionItem } from "./client-section-items";

interface ClientSectionNavProps {
  items: SectionItem[];
}

/**
 * Sticky horizontal scroll-spy nav (desktop). One shared IntersectionObserver
 * highlights the section in view; clicking smooth-scrolls to the matching id.
 * Hidden on mobile — the burger menu (ClientSectionMenu) takes over there.
 */
export function ClientSectionNav({ items }: ClientSectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const navRef = useRef<HTMLElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Single shared observer over the section anchors present in the DOM.
  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  // Keep the active button visible inside the scrollable bar.
  useEffect(() => {
    const btn = activeBtnRef.current;
    if (!btn) return;
    const id = requestAnimationFrame(() => {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    return () => cancelAnimationFrame(id);
  }, [activeId]);

  const handleClick = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(sectionId);
    }
  };

  if (items.length === 0) return null;

  return (
    <nav
      ref={navRef}
      aria-label="أقسام الصفحة"
      className="sticky top-0 z-[5] hidden border-y border-border bg-background/95 backdrop-blur lg:flex overflow-x-auto scrollbar-none"
    >
      <div className="flex gap-1 px-4 py-2">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={isActive ? activeBtnRef : undefined}
              type="button"
              onClick={() => handleClick(item.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "whitespace-nowrap rounded-md px-3.5 py-2 text-[13px] font-bold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-primary/[0.08] text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
