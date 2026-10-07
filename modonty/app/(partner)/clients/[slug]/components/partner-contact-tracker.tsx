"use client";

import { useEffect } from "react";
import { trackCtaClick } from "@/lib/analytics/cta-tracking";
import { recordWhatsappLead } from "@/components/shared/booking-form/booking-actions";
import { getContactKind } from "../helpers/get-contact-kind";

/**
 * The client page's catch-all for «call» and «WhatsApp» — one listener for every button on it.
 *
 * Measured 7 Oct 2026: the partner-site templates (header · footer · booking block · contact
 * cards — 12 files under shared/components/partner-site) render WhatsApp and phone as plain
 * anchors (`parts/whatsapp-button.tsx`). Shared code cannot import modonty's tracking, so a tap on
 * them recorded nothing: no lead in «طلبات التواصل», no ring in the client's app, no row in
 * «Article Conversions». A local click on the header's WhatsApp left `bookings: []`.
 *
 * Delegated, not per button: the templates stay app-agnostic, and a new template is covered the day
 * it ships. Anchors that already track themselves carry `data-cta-tracked` and are skipped, so no
 * click is counted twice. The server credits the article this visitor read
 * (resolve-article-from-recent-view.ts).
 */
export function PartnerContactTracker({ clientId }: { clientId: string }) {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.closest("[data-cta-tracked]")) return;
      const href = anchor.getAttribute("href") ?? "";
      const kind = getContactKind(href);
      if (!kind) return;
      trackCtaClick({ type: "LINK", label: `partner-site:${kind}`, targetUrl: href, clientId });
      if (kind === "whatsapp") void recordWhatsappLead({ clientId, source: "client_page" });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [clientId]);

  return null;
}
