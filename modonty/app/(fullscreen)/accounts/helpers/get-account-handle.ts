/**
 * The handle a visitor recognises — `@modonty.sa` under «انستغرام» — read from the saved URL.
 * Seeing the handle before tapping is what tells a visitor this is the real account.
 *
 * Returns null when the URL carries no readable handle (a Facebook `profile.php?id=…`, a
 * WhatsApp channel id): a number is not a name, and a wrong-looking handle is worse than none.
 */
export function getAccountHandle(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  // A WhatsApp channel's path is an invite code (`/channel/0029Va…`), not a name.
  if (url.hostname.endsWith("whatsapp.com")) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  // linkedin.com/company/<name> · youtube.com/c/<name> · snapchat.com/add/<name>
  const skip = new Set(["company", "in", "c", "channel", "add", "user"]);
  const segment = parts.find((p) => !skip.has(p.toLowerCase()));
  if (!segment || segment.includes(".php") || /^\d+$/.test(segment)) return null;

  const clean = decodeURIComponent(segment).replace(/^@/, "");
  return clean.length > 0 && clean.length <= 40 ? `@${clean}` : null;
}
