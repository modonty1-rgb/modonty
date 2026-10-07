"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { claritySet } from "@/lib/analytics/clarity";
import { pageTypeOf } from "../../helpers/page-type-of";

/**
 * Clarity tag `page_type` on every page (plan ج٦, 2 Oct 2026): Clarity could not be filtered
 * by kind of page. The client and author tags are set where those are known — the article,
 * client and reel trackers.
 */
export function ClarityPageType() {
  const pathname = usePathname();
  useEffect(() => {
    claritySet("page_type", pageTypeOf(pathname));
  }, [pathname]);
  return null;
}
