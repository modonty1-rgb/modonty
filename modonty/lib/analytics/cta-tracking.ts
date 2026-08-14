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
    if (typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "cta_click",
        cta_label: payload.label,
        cta_type: payload.type,
        cta_target_url: payload.targetUrl,
        ...(payload.articleId && { cta_article_id: payload.articleId }),
        ...(payload.clientId && { cta_client_id: payload.clientId }),
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
