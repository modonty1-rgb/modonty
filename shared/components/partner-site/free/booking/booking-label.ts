import type { HomeData } from "../home/home-data";

/**
 * The request button's text — one place for the cover, the booking block and the closing CTA,
 * which each carried their own copy of the default. The admin's own label always wins. The
 * fallback was «احجز الآن», wrong for a shop or an agency (4 Oct 2026); «أرسل طلبك» fits any
 * partner whose button opens the request form.
 */
export function bookingLabel(booking: HomeData["booking"]): string {
  if (booking.label?.trim()) return booking.label.trim();
  return booking.mode === "FORM" ? "أرسل طلبك" : "تواصل معنا";
}
