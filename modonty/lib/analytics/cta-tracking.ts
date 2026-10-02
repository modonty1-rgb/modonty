import { pushGa4Event } from "./ga4-browser";

export type CTAType = "BUTTON" | "LINK" | "FORM" | "BANNER" | "POPUP";

export interface CtaClickPayload {
  type: CTAType;
  label: string;
  targetUrl: string;
  articleId?: string;
  clientId?: string;
  timeOnPage?: number;
  scrollDepth?: number;
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export function trackCtaClick(payload: CtaClickPayload): void {
  try {
    // GA4 outbound_click goes from the browser (GTM), not from /api/track/cta-click — a
    // server-sent event became a phantom GA4 session (see ga4-browser.ts). The route keeps the
    // DB row + the partner's Telegram notice.
    if (payload.targetUrl) {
      pushGa4Event("outbound_click", {
        cta_label: payload.label,
        cta_type: payload.type.toLowerCase(),
        cta_target_url: payload.targetUrl,
      });
    }
    fetch("/api/track/cta-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // no-op
  }
}
