"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Real-user (field) Core Web Vitals → GA4.
 *
 * Sends each metric (LCP · INP · CLS · FCP · TTFB) via `navigator.sendBeacon` to
 * `/api/track/web-vitals`, which forwards to GA4 through the SAME server-side
 * Measurement Protocol path every other Modonty event uses (events-registry →
 * ga4-server). This guarantees delivery with NO dependency on a GTM-dashboard tag,
 * and avoids double-counting.
 *
 * Why field (not lab): Lighthouse cannot measure INP and only samples one
 * device/network — real-user field data is the source of truth Google ranks on
 * (web.dev). The 'use client' boundary is confined to this component (returns null).
 */
// Server route accepts only the 5 Core Web Vitals; next/web-vitals also emits custom
// framework metrics (Next.js-hydration/render/route-change) we don't forward — filtering
// them here avoids needless beacons + 400 console noise. Static Set lives outside render.
const CORE_METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (!CORE_METRICS.has(metric.name)) return;

    // CLS is unitless → ×1000 to keep an integer for GA4; the rest are milliseconds.
    const isCls = metric.name === "CLS";
    const body = JSON.stringify({
      metric_name: metric.name,
      metric_value: Math.round(isCls ? metric.value * 1000 : metric.value),
      metric_rating: metric.rating,
      metric_delta: Math.round(isCls ? metric.delta * 1000 : metric.delta),
      metric_id: metric.id,
      metric_nav_type: metric.navigationType,
      page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/track/web-vitals", body);
      } else {
        fetch("/api/track/web-vitals", { method: "POST", body, keepalive: true }).catch(() => {});
      }
    } catch {
      // Analytics must never break the page.
    }
  });

  return null;
}
