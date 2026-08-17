"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Folds its child away while the visitor scrolls down and brings it back on the first
 * scroll up (or at the top). Pure DOM toggling of one data attribute — no React state,
 * no re-render per scroll; the CSS transition lives on the child.
 */
export function CollapseOnScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last;
      // Ignore the tiny jitter the collapse itself causes; only real intent flips it.
      if (Math.abs(delta) < 12 && y > 80) return;
      el.dataset.collapsed = delta > 0 && y > 80 ? "true" : "false";
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      data-collapsed="false"
      className="grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none data-[collapsed=true]:grid-rows-[0fr] data-[collapsed=true]:opacity-0 grid-rows-[1fr]"
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
