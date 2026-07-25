import { normalizePhone } from "@modonty/database/lib/phone";

/**
 * WhatsApp number for `wa.me` — one rule for the hero CTA, sidebar quick-contact,
 * floating FAB, and mobile dock. Delegates to the shared Saudi+Egypt normalizer.
 */
export function getWhatsAppNumber(phone: string): string {
  // One canonical normalizer (Saudi + Egypt) — fixes the old Saudi-only guess that mangled
  // Egyptian local numbers (`01…` → `966…`). wa.me needs the digits without the leading `+`.
  const e164 = normalizePhone(phone);
  if (e164) return e164.replace(/^\+/, "");
  // Un-normalizable (two numbers / landline): best-effort so the link isn't empty — these
  // clients are surfaced in the admin «Errors to fix» card for a manual correction.
  return phone.replace(/\D/g, "");
}

/** Full wa.me link, optionally with a pre-filled message. */
export function getWhatsAppLink(phone: string, message?: string): string {
  const base = `https://wa.me/${getWhatsAppNumber(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Modonty-attributed booking greeting — one source for every WhatsApp booking CTA. */
export function bookingWhatsappMessage(clientName: string): string {
  return `السلام عليكم 👋 وصلت لكم عبر منصّة «مدوّنتي» وأبغى أحجز موعد في ${clientName} 🌟`;
}
