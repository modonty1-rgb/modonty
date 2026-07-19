"use client";

import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { recordWhatsappLead, type BookingSource } from "@/app/articles/[slug]/actions/booking-actions";

// #25d366 = WhatsApp brand green.
const WA_GREEN = "#25d366";

interface WhatsAppBookingCtaProps {
  clientId: string;
  /** Client's WhatsApp number (E.164 preferred). Caller must ensure it exists. */
  phone: string;
  clientName: string;
  source: BookingSource;
  articleId?: string | null;
  className?: string;
}

/**
 * Primary WhatsApp CTA — opens wa.me with a Modonty-attributed pre-filled message and,
 * the instant it's tapped, records a deduped «تواصل واتساب» lead server-side
 * (recordWhatsappLead → BookingRequest channel:whatsapp + GA4 booking_whatsapp_click).
 * target="_blank" lets the lead write complete while WhatsApp launches in a new tab.
 */
export function WhatsAppBookingCta({
  clientId,
  phone,
  clientName,
  source,
  articleId,
  className,
}: WhatsAppBookingCtaProps) {
  const message = `السلام عليكم 👋 وصلت لكم عبر منصّة «مدوّنتي» وأبغى أحجز موعد في ${clientName} 🌟`;
  const href = getWhatsAppLink(phone, message);

  function handleClick() {
    // fire-and-forget: the lead is recorded server-side; the link opens WhatsApp.
    void recordWhatsappLead({ clientId, source, articleId: articleId ?? null });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label={`تواصل عبر واتساب مع ${clientName}`}
      className={
        className ??
        "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-base font-bold text-white shadow-[0_14px_26px_-12px_rgba(37,211,102,0.7)] transition-opacity hover:opacity-90"
      }
      style={{ backgroundColor: WA_GREEN }}
    >
      <WhatsAppIcon className="h-5 w-5" />
      تواصل عبر واتساب
    </a>
  );
}
