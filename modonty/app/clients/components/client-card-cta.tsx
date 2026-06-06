"use client";

import { Button } from "@/components/ui/button";
import { IconExternal } from "@/lib/icons";
import { trackCtaClick } from "@/lib/cta-tracking";

interface ClientCardCtaProps {
  clientId: string;
  url: string;
  label?: string | null;
}

/**
 * LINK-mode primary CTA on a listing card («تسوّق الآن» → external store).
 * Uses the stopPropagation pattern so the click opens the store instead of
 * navigating to the client page (the card itself is a Link). FORM-mode clients
 * don't get this — the card already routes to their page where the booking lives.
 */
export function ClientCardCta({ clientId, url, label }: ClientCardCtaProps) {
  const text = label?.trim() || "تسوّق الآن";
  return (
    <Button
      size="sm"
      className="shrink-0 gap-1.5"
      aria-label={text}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        trackCtaClick({ type: "LINK", label: text, targetUrl: url, clientId });
        window.open(url, "_blank", "noopener,noreferrer");
      }}
    >
      <IconExternal className="h-4 w-4" />
      {text}
    </Button>
  );
}
