"use client";

import { useState } from "react";

import { trackCtaClick } from "@/lib/analytics/cta-tracking";
import { IconCheck, IconShare } from "@/lib/icons";

/**
 * Share /accounts — the phone's own share sheet (WhatsApp, Instagram, Messages…) where it
 * exists, and a copied link where it does not (desktop browsers). Same rule as the reels
 * share button: native first, clipboard as the fallback, and the page never navigates away.
 *
 * The shared URL is the clean one — no UTM. A campaign tag travels with every re-share and
 * would file strangers' visits under the network the FIRST sharer came from.
 */
export function ShareAccountsButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        trackCtaClick({ type: "BUTTON", label: "accounts:share_native", targetUrl: url });
        return;
      }
      await navigator.clipboard.writeText(url);
      trackCtaClick({ type: "BUTTON", label: "accounts:share_copy", targetUrl: url });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the visitor closed the share sheet — nothing to do */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "انتسخ الرابط" : "شارك الصفحة"}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-card px-3.5 text-[clamp(0.75rem,0.65rem+0.5vw,0.8125rem)] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground motion-safe:active:scale-95"
    >
      {copied ? <IconCheck className="size-4" aria-hidden /> : <IconShare className="size-4" aria-hidden />}
      {copied ? "انتسخ الرابط" : "شارك"}
    </button>
  );
}
