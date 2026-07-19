"use client";

import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { recordWhatsappLead } from "@/app/articles/[slug]/actions/booking-actions";

// #25d366 = WhatsApp brand green — local literal, not a design token.
const WA_GREEN = "#25d366";

interface ClientWhatsAppFabProps {
  phone: string | null;
  clientId?: string;
}

/** Floating WhatsApp button (bottom-start, pulsing, icon-only). On mobile it lifts
 *  above the sticky bottom bar (bottom-20); on desktop there's no bar so it sits low. */
export function ClientWhatsAppFab({ phone, clientId }: ClientWhatsAppFabProps) {
  if (!phone) return null;

  return (
    <CtaTrackedLink
      href={getWhatsAppLink(phone)}
      label="Floating WA"
      type="LINK"
      clientId={clientId}
      onBeforeNavigate={
        clientId ? () => void recordWhatsappLead({ clientId, source: "client_page" }) : undefined
      }
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      title="تواصل عبر واتساب"
      className="fixed bottom-20 start-4 z-[60] inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_16px_32px_-10px_rgba(37,211,102,0.65)] lg:bottom-6 lg:start-6 lg:h-14 lg:w-14"
      style={{ backgroundColor: WA_GREEN }}
    >
      {/* pulse ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full animate-ping"
        style={{ backgroundColor: WA_GREEN, opacity: 0.45 }}
      />
      <WhatsAppIcon className="relative size-6 lg:size-7" />
    </CtaTrackedLink>
  );
}
