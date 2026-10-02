"use client";

import { useReportWebVitals } from "next/web-vitals";

import { pushGa4Event } from "@/lib/analytics/ga4-browser";

/**
 * Real-user (field) Core Web Vitals → GA4, pushed from the browser to GTM.
 *
 * Until Oct 2026 each metric went by sendBeacon to /api/track/web-vitals and on to GA4 via
 * Measurement Protocol — and web_vitals alone was 31,245 of the events inside GA4's phantom
 * «Unassigned» sessions (30 days to 1 Oct 2026; see lib/analytics/ga4-browser.ts). The
 * web-vitals library's own GA4 example sends the same params with gtag from the page.
 *
 * Why field (not lab): Lighthouse cannot measure INP and only samples one
 * device/network — real-user field data is the source of truth Google ranks on
 * (web.dev). The 'use client' boundary is confined to this component (returns null).
 */
// next/web-vitals also emits custom framework metrics (Next.js-hydration/render/route-change)
// that GA4 has no use for. Static Set lives outside render.
const CORE_METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (!CORE_METRICS.has(metric.name)) return;

    // CLS is unitless → ×1000 to keep an integer for GA4; the rest are milliseconds.
    const isCls = metric.name === "CLS";
    pushGa4Event("web_vitals", {
      metric_name: metric.name,
      metric_value: Math.round(isCls ? metric.value * 1000 : metric.value),
      metric_rating: metric.rating,
      metric_delta: Math.round(isCls ? metric.delta * 1000 : metric.delta),
      metric_id: metric.id,
      metric_nav_type: metric.navigationType,
    });
  });

  return null;
}
