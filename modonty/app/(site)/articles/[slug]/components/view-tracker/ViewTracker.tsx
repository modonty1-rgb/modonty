"use client";

import { useEffect, useRef } from "react";

import { pushGa4Event } from "@/lib/analytics/ga4-browser";
import { claritySet } from "@/lib/analytics/clarity";
import { getScrollDepth } from "../../helpers/get-scroll-depth";
import { sendArticleView } from "../../helpers/send-article-view";
import { sendArticleLeave } from "../../helpers/send-article-leave";

const BOUNCE_TIME_SEC = 30;
const BOUNCE_SCROLL_THRESHOLD = 10;

interface ArticleViewTrackerProps {
  articleSlug: string;
}

export function ArticleViewTracker({ articleSlug }: ArticleViewTrackerProps) {
  const analyticsIdRef = useRef<string | null>(null);
  const loadTimeRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);

  useEffect(() => {
    loadTimeRef.current = Date.now();
    sendArticleView(articleSlug)
      .then((data) => {
        if (data?.analyticsId) analyticsIdRef.current = data.analyticsId;
        // Only a counted view carries `ga4` — a refresh-in-place returns none, so GA4 and
        // the DB count the same views.
        if (data?.ga4) pushGa4Event("article_view", data.ga4);
        // Clarity tags (plan ج٦): filter recordings by client and by writer — on every visit.
        claritySet("client", data?.clarity?.client);
        claritySet("author", data?.clarity?.author);
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
      sendArticleLeave(articleSlug, id, { timeOnPage, scrollDepth, bounced });
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
    // `articleSlug` is now part of the beacon URL, so it must be a dependency —
    // otherwise a client-side nav to another article would report the old slug.
  }, [articleSlug]);

  return null;
}
