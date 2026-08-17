"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Folds its child away while the visitor scrolls down and brings it back on the first
 * scroll up (or at the top). Pure DOM toggling of one data attribute — no React state,
 * no re-render per scroll. Folding is animated; unfolding snaps — an animated unfold on
 * page change pushed the header down 36px in front of the visitor (Khalid: «فليكر»).
 */
export function CollapseOnScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // A new page starts at the top with the bar open — never inherit a folded bar.
  useEffect(() => {
    if (ref.current) ref.current.dataset.collapsed = "false";
  }, [pathname]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last;
      // Ignore the tiny jitter the fold itself causes; only real intent flips it.
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
      className="grid grid-rows-[1fr] data-[collapsed=true]:grid-rows-[0fr] data-[collapsed=true]:opacity-0 data-[collapsed=true]:transition-[grid-template-rows,opacity] data-[collapsed=true]:duration-300 motion-reduce:transition-none"
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
