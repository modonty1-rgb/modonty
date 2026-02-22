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

export function trackCtaClick(payload: CtaClickPayload): void {
  try {
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
