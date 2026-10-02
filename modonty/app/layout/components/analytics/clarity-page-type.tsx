"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { claritySet } from "@/lib/analytics/clarity";

/** First path segment → the kind of page, so Clarity recordings can be filtered by it. */
function pageTypeOf(pathname: string): string {
  const [first, second] = pathname.split("/").filter(Boolean);
  if (!first) return "home";
  if (first === "articles") return second ? "article" : "articles";
  if (first === "clients") return second ? "client" : "clients";
  if (first === "reels") return second ? "reel" : "reels";
  if (first === "users") return "account";
  if (["categories", "tags", "industries", "authors", "trending"].includes(first)) return "listing";
  return "other";
}

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
