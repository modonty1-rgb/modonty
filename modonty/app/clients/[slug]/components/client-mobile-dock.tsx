"use client";

import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { IconWebsite } from "@/lib/icons";
import { getWhatsAppLink } from "@/lib/whatsapp";

import { BookingDialog } from "@/app/articles/[slug]/components/booking-dialog";

interface ClientMobileDockProps {
  clientId: string;
  clientName: string;
  ctaMode: "FORM" | "LINK" | "NONE";
  linkUrl: string | null;
  phone: string | null;
  user: { name: string | null; email: string | null } | null;
}

/** Sticky bottom action bar (mobile only): «احجز الآن» + WhatsApp quick contact. */
export function ClientMobileDock({
  clientId,
  clientName,
  ctaMode,
  linkUrl,
  phone,
  user,
}: ClientMobileDockProps) {
  // Nothing to show: no CTA and no WhatsApp number.
  if (ctaMode === "NONE" && !phone) return null;

  const hasLink = ctaMode === "LINK" && !!linkUrl;

  return (
    <div className="sticky bottom-0 z-40 flex gap-2 border-t border-border bg-background/98 p-3 backdrop-blur lg:hidden">
      {ctaMode === "FORM" && (
        <div className="flex-1">
          <BookingDialog
            clientId={clientId}
            clientName={clientName}
            source="client_page"
            user={user}
          />
        </div>
      )}

      {hasLink && (
        <CtaTrackedLink
          href={linkUrl as string}
          label="احجز الآن"
          type="BUTTON"
          clientId={clientId}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <IconWebsite className="h-4 w-4" />
          احجز الآن
        </CtaTrackedLink>
      )}

      {phone && (
        <a
          href={getWhatsAppLink(phone)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`تواصل مع ${clientName} عبر واتساب`}
          className="inline-flex w-[54px] flex-none items-center justify-center rounded-md border border-success/30 bg-success/10 text-success transition-colors hover:bg-success/20"
        >
          <WhatsAppIcon size={22} />
        </a>
      )}
    </div>
  );
}
