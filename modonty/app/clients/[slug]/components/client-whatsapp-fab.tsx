"use client";

import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { getWhatsAppLink } from "@/lib/whatsapp";

// #25d366 = WhatsApp brand green — local literal, not a design token.
const WA_GREEN = "#25d366";

interface ClientWhatsAppFabProps {
  phone: string | null;
  clientId?: string;
}

/** Desktop-only floating WhatsApp button (bottom-start, pulsing, icon-only). Hidden on mobile to avoid the dock. */
export function ClientWhatsAppFab({ phone, clientId }: ClientWhatsAppFabProps) {
  if (!phone) return null;

  return (
    <CtaTrackedLink
      href={getWhatsAppLink(phone)}
      label="Floating WA"
      type="LINK"
      clientId={clientId}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      title="تواصل عبر واتساب"
      className="fixed bottom-6 start-6 z-[60] hidden h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_16px_32px_-10px_rgba(37,211,102,0.65)] lg:inline-flex"
      style={{ backgroundColor: WA_GREEN }}
    >
      {/* pulse ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full animate-ping"
        style={{ backgroundColor: WA_GREEN, opacity: 0.45 }}
      />
      <WhatsAppIcon size={28} className="relative" />
    </CtaTrackedLink>
  );
}
