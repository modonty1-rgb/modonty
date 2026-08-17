"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Height of the platform bar — the distance the block slides up to hide it. Keep in step with PlatformBar (h-9). */
const BAR_PX = 36;

/**
 * The sticky block (platform bar + partner header). Scrolling down slides the whole block
 * up by the bar's height so the partner header lands at the top; scrolling up (or a new
 * page) brings it back. It moves with `transform` ONLY — never height/opacity — because
 * animating layout re-lays the sticky box on every frame and the bar was visibly
 * half-faded over the cover (Khalid: «فليكر»). Transform stays on the compositor.
 */
export function StickyChrome({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // A new page starts with the bar visible — never inherit a hidden bar.
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
      if (Math.abs(delta) < 12 && y > BAR_PX * 2) return;
      el.dataset.collapsed = delta > 0 && y > BAR_PX * 2 ? "true" : "false";
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      data-collapsed="false"
      style={{ ["--bar" as string]: `${BAR_PX}px` }}
      className="sticky top-0 z-40 will-change-transform transition-transform duration-300 ease-out motion-reduce:transition-none data-[collapsed=true]:-translate-y-[var(--bar)]"
    >
      {children}
    </div>
  );
}
