"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sendPageView } from "../../helpers/send-page-view";

/**
 * Universal page-view beacon. Fires once per genuine navigation, AFTER render
 * (useEffect) via fetch+keepalive — never blocks the critical path / Core Web
 * Vitals. Article + client pages have their own trackers, so they're skipped
 * here to avoid double-counting. The server suppresses refresh-in-place; a
 * return after navigating elsewhere counts (lastSent resets per navigation).
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/articles/") || pathname.startsWith("/clients/")) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    sendPageView(pathname);
  }, [pathname]);

  return null;
}
