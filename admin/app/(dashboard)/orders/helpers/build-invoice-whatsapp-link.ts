import { normalizePhone } from "@modonty/shared/lib/phone";

/**
 * wa.me deep link with the ready invoice message (PAY-E6 · PAY-Q13). The number must be
 * E.164 digits with no «+» (shared/lib/phone.ts) — null when the buyer's phone cannot be
 * normalised, so the page shows why instead of a link that opens nothing.
 */
export function buildInvoiceWhatsappLink(p: { phone: string; clientName: string; invoiceNumber: string; totalLabel: string; consoleUrl: string | null }): { href: string } | { error: string } {
  const e164 = normalizePhone(p.phone);
  if (!e164) return { error: "رقم الجوال في الطلب لا يصلح لواتساب" };
  const where = p.consoleUrl ? `، وتجدها في لوحتك: ${p.consoleUrl.replace(/\/$/, "")}/dashboard/invoices` : "";
  const text = `مرحباً ${p.clientName}،\nأصدرنا فاتورتك رقم ${p.invoiceNumber} بقيمة ${p.totalLabel}.\nأُرسلت إلى بريدك الإلكتروني${where}.\nشكراً لتعاملك مع مُدَوَّنَتِي.`;
  return { href: `https://wa.me/${e164.replace(/^\+/, "")}?text=${encodeURIComponent(text)}` };
}
