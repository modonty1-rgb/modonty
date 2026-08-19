"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "End", "Home"]);

/**
 * Mounts a lazy subtree only when its placeholder approaches the viewport — AND only
 * after the visitor has moved the page at least once since this hook mounted.
 *
 * The movement condition is what keeps a restored viewport honest: on reload or
 * back/forward the browser can land with the placeholder already on screen, and an
 * infinite list mounted at that moment would fetch the next chunk and rewrite the URL
 * before anyone moved. This hook mounts early (it is in the page's client bundle), so
 * it can tell movement from stillness; the lazy subtree cannot.
 *
 * On restored documents (`navigation.type` reload / back_forward) the browser's own
 * scroll restoration also fires `scroll`, and it was measured firing after this hook
 * mounted — so there, only input that a person produces counts: wheel, touch, scroll
 * keys. A fresh navigation has no restoration, so its `scroll` events are the visitor's.
 * Fires once, then disconnects.
 */
export function useMountOnApproach(rootMargin = "200px") {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!ref.current || mounted) return;

    let moved = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (moved && entries[0]?.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );
    observer.observe(ref.current);

    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const navigationType = navigationEntry?.type ?? "navigate";
    const restored = navigationType !== "navigate";

    /**
     * A page that cannot scroll can never produce the movement this hook waits for, so the gate
     * would stay shut forever and the lazy list below it would never load — measured 2026-08-19
     * on `/articles?time=short`: document height 2667 === viewport height 2667, zero fetches, and
     * seven articles unreachable by any means. Khalid had been seeing this repeatedly.
     *
     * The movement condition exists to stop an auto-fetch on a RESTORED viewport, and that risk
     * needs a scrollbar to exist at all. With nothing to scroll there is nothing to guard against.
     * Re-checked on resize, because a page can become unscrollable after content collapses.
     */
    const syncScrollability = () => {
      const canScroll = document.documentElement.scrollHeight > window.innerHeight + 1;
      if (!canScroll && !moved) onMove();
    };

    // Re-observing replays the current intersection, so a placeholder that was already
    // on screen mounts on the first real movement instead of waiting for the next one.
    const onMove = () => {
      moved = true;
      if (ref.current) {
        observer.unobserve(ref.current);
        observer.observe(ref.current);
      }
      detach();
    };
    const onKey = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) onMove();
    };
    const opts = { passive: true } as const;
    const attach = () => {
      if (restored) {
        window.addEventListener("wheel", onMove, opts);
        window.addEventListener("touchmove", onMove, opts);
        window.addEventListener("keydown", onKey, opts);
      } else {
        window.addEventListener("scroll", onMove, opts);
      }
    };
    const detach = () => {
      window.removeEventListener("wheel", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMove);
    };
    attach();

    // After paint: layout must be settled before asking whether the page can scroll at all.
    const raf = requestAnimationFrame(syncScrollability);
    window.addEventListener("resize", syncScrollability, opts);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", syncScrollability);
      observer.disconnect();
      detach();
    };
  }, [mounted, rootMargin]);

  return { ref, mounted };
}
