"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/** Header height the rail sits under (h-20). Pages with a shorter header pass their own. */
const HEADER_OFFSET = 80;
/** Breathing room under a rail that is taller than the viewport. */
const BOTTOM_GAP = 16;

interface StickyRailProps {
  label: string;
  className?: string;
  /** Distance from the top of the viewport, in pixels. Defaults to the h-20 header. */
  offset?: number;
  children: ReactNode;
}

// A sticky rail that behaves like LinkedIn's: a rail shorter than the viewport sticks
// under the header; a TALLER one scrolls with the page until its bottom reaches the
// viewport bottom, then sticks there — so the whole rail can be seen without an inner
// scrollbar. CSS alone can't express "stick when my bottom reaches the fold" without
// knowing the element's height, so the only client work here is measuring that height
// and writing one `top` value. Server content comes in as children and never hydrates.
export function StickyRail({ label, className, offset = HEADER_OFFSET, children }: StickyRailProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;

    const place = () => {
      const overflow = rail.offsetHeight + offset + BOTTOM_GAP - window.innerHeight;
      rail.style.top = `${overflow > 0 ? offset - overflow : offset}px`;
    };

    place();
    const observer = new ResizeObserver(place); // rail content streams in (session card) and grows
    observer.observe(rail);
    window.addEventListener("resize", place, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [offset]);

  return (
    <aside ref={ref} aria-label={label} className={className} style={{ top: offset }}>
      {children}
    </aside>
  );
}
