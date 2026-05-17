"use client";

import { useState, type ReactNode } from "react";
import { IconChevronDown, IconChevronUp } from "@/lib/icons";

interface FaqCollapsibleBodyProps {
  headingId: string;
  title: string;
  children: ReactNode;
}

/**
 * Small client wrapper that owns the collapse toggle for the article FAQ.
 *
 * The FAQ cards themselves are rendered server-side and passed in as
 * `children` — Googlebot + AI engines see them in raw HTML regardless of
 * the open/closed state (CSS-only hide, not DOM removal).
 */
export function FaqCollapsibleBody({ headingId, title, children }: FaqCollapsibleBodyProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsCollapsed((c) => !c)}
        className="flex w-full items-center justify-between gap-2 rounded-md hover:bg-muted/50 p-2 -m-2 transition-colors text-right"
        aria-expanded={!isCollapsed}
        aria-controls={`${headingId}-body`}
      >
        <div className="flex flex-col items-end">
          <h2 id={headingId} className="text-xs font-semibold text-muted-foreground uppercase shrink-0">
            {title}
          </h2>
          <span className="text-xs text-muted-foreground">
            {isCollapsed ? "انقر لعرض الأسئلة" : "انقر للإخفاء"}
          </span>
        </div>
        <span className="shrink-0 text-muted-foreground" aria-hidden>
          {isCollapsed ? <IconChevronDown className="h-5 w-5" /> : <IconChevronUp className="h-5 w-5" />}
        </span>
      </button>
      <div id={`${headingId}-body`} className={isCollapsed ? "hidden" : "space-y-4"}>
        {children}
      </div>
    </>
  );
}
