"use client";

import { useEffect, useRef } from "react";

const BOUNCE_TIME_SEC = 30;
const BOUNCE_SCROLL_THRESHOLD = 10;

interface ArticleViewTrackerProps {
  articleSlug: string;
}

function getScrollDepth(): number {
  if (typeof window === "undefined" || typeof document === "undefined") return 0;
  const { scrollY, innerHeight } = window;
  const { scrollHeight } = document.body;
  if (scrollHeight <= 0) return 0;
  const depth = ((scrollY + innerHeight) / scrollHeight) * 100;
  return Math.min(100, Math.round(depth * 10) / 10);
}

export function ArticleViewTracker({ articleSlug }: ArticleViewTrackerProps) {
  const analyticsIdRef = useRef<string | null>(null);
  const loadTimeRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);

  useEffect(() => {
    loadTimeRef.current = Date.now();
    const slug = encodeURIComponent(articleSlug);
    fetch(`/api/articles/${slug}/view`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.analyticsId) analyticsIdRef.current = data.analyticsId;
      })
      .catch(() => {});
  }, [articleSlug]);

  useEffect(() => {
    const onScroll = () => {
      const depth = getScrollDepth();
      if (depth > maxScrollRef.current) maxScrollRef.current = depth;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sendLeave = () => {
      const id = analyticsIdRef.current;
      if (!id) return;
      const timeOnPage = (Date.now() - loadTimeRef.current) / 1000;
      const scrollDepth = maxScrollRef.current;
      const bounced = timeOnPage < BOUNCE_TIME_SEC && scrollDepth < BOUNCE_SCROLL_THRESHOLD;
      const payload = JSON.stringify({ timeOnPage, scrollDepth, bounced });
      fetch(`/api/track/analytics/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
      analyticsIdRef.current = null;
    };

    const onPageHide = () => sendLeave();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") sendLeave();
    };

    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
