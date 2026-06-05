import { NextResponse } from "next/server";

import { trackWebVitals } from "@/lib/analytics/events-registry";

// Core Web Vitals (RUM) → GA4 via the same server-side Measurement Protocol path
// every other event uses (events-registry → ga4-server). No GTM-dashboard tag needed.
// Called from the client WebVitals component via navigator.sendBeacon on each metric.
const VALID_METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.metric_name === "string" ? body.metric_name : null;
    if (!name || !VALID_METRICS.has(name)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // trackWebVitals resolves visitor + session ids (getVisitorContext) and fires the
    // GA4 event via after() — safe to await here (the GA4 fetch itself is non-blocking).
    await trackWebVitals({
      metric_name: name,
      metric_value: typeof body.metric_value === "number" ? body.metric_value : 0,
      metric_rating: typeof body.metric_rating === "string" ? body.metric_rating : undefined,
      metric_id: typeof body.metric_id === "string" ? body.metric_id : undefined,
      metric_delta: typeof body.metric_delta === "number" ? body.metric_delta : undefined,
      metric_nav_type: typeof body.metric_nav_type === "string" ? body.metric_nav_type : undefined,
      page_path: typeof body.page_path === "string" ? body.page_path.slice(0, 200) : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
