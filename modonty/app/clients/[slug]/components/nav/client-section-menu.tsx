"use client";

import { useRef } from "react";

import { IconList } from "@/lib/icons";
import { cn } from "@/lib/utils";

import type { SectionItem } from "./client-section-items";

interface ClientSectionMenuProps {
  items: SectionItem[];
}

/**
 * Mobile-only collapsible burger «☰ أقسام الصفحة». Wraps the same anchor list;
 * clicking an item smooth-scrolls and closes the menu.
 */
export function ClientSectionMenu({ items }: ClientSectionMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  if (items.length === 0) return null;

  const handleClick = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return (
    <details
      ref={detailsRef}
      className="rounded-lg border border-border bg-card lg:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold text-foreground">
        <IconList className="h-4 w-4" aria-hidden />
        أقسام الصفحة
      </summary>
      <nav aria-label="أقسام الصفحة" className="flex flex-wrap gap-1 px-3 pb-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.id)}
            className={cn(
              "whitespace-nowrap rounded-md px-3.5 py-2 text-[13px] font-bold transition-colors",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </details>
  );
}
