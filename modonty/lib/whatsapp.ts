/**
 * Saudi-aware WhatsApp number normalizer (lifted from client-contact so the hero
 * CTA, sidebar quick-contact, floating FAB, and mobile dock all share one rule).
 * 05xxxxxxxx → 9665xxxxxxxx · bare 9-digit → 966-prefixed · already-966 → as-is.
 */
export function getWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "966" + digits.slice(1);
  if (!digits.startsWith("966") && digits.length <= 9) return "966" + digits;
  return digits;
}

/** Full wa.me link, optionally with a pre-filled message. */
export function getWhatsAppLink(phone: string, message?: string): string {
  const base = `https://wa.me/${getWhatsAppNumber(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
