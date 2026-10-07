/** رابطُ واتساب؟ — كي لا يظهر بجانب زرٍّ هو نفسُه واتساب (فلو زرّ المقال، ٣ أكتوبر ٢٠٢٦). */
export function isWhatsAppUrl(raw: string | null | undefined): boolean {
  if (!raw) return false;
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    return host === "wa.me" || host.endsWith("whatsapp.com");
  } catch {
    return false;
  }
}
