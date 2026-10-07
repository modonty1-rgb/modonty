/** Which lead a tapped anchor is: a phone call, a WhatsApp chat, or neither. */
export function getContactKind(href: string): "whatsapp" | "call" | null {
  if (href.startsWith("tel:")) return "call";
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    return host === "wa.me" || host.endsWith("whatsapp.com") ? "whatsapp" : null;
  } catch {
    return null;
  }
}
