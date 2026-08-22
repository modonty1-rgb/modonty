"use client";

import { useState, type ReactNode } from "react";

import { SectionBar } from "@/app/(site)/articles/[slug]/components/section-bar/SectionBar";

interface FaqCollapsibleBodyProps {
  headingId: string;
  title: string;
  /** Shown in the bar so a closed section still says how much is inside. */
  count?: number | null;
  children: ReactNode;
}

/**
 * Small client wrapper that owns the collapse toggle for the article FAQ.
 *
 * The FAQ cards themselves are rendered server-side and passed in as
 * `children` — Googlebot + AI engines see them in raw HTML regardless of
 * the open/closed state (CSS-only hide, not DOM removal).
 */
export function FaqCollapsibleBody({ headingId, title, count, children }: FaqCollapsibleBodyProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const open = !isCollapsed;

  return (
    <>
      {/* The shared bar (Khalid, 21 Aug): this section used to wear its own shape — a small grey
          uppercase label with «انقر لعرض الأسئلة» under it — while the sections collapsed during
          the mobile refactor wore another. Same control, same look now. */}
      <h2 id={headingId} className="contents">
        <SectionBar
          title={title}
          count={count}
          open={open}
          onToggle={() => setIsCollapsed((c) => !c)}
          controls={`${headingId}-body`}
        />
      </h2>
      <div
        id={`${headingId}-body`}
        // The frame is the phone's: there the bar and its panel have to read as one object.
        // Inside the desktop card it would be a border drawn inside a border, which is the
        // double-framing every design system warns about — so it stops at `lg`.
        className={
          open
            ? "space-y-4 max-lg:rounded-b-xl max-lg:border max-lg:border-border max-lg:p-3"
            : "hidden"
        }
      >
        {children}
      </div>
    </>
  );
}
