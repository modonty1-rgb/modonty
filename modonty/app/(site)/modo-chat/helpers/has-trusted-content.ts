import "server-only";

/** Social, video and recipe sites — never a source for a professional answer. */
const UNTRUSTED_DOMAINS = [
  "tiktok.com", "youtube.com", "youtu.be", "instagram.com",
  "twitter.com", "x.com", "facebook.com", "snapchat.com",
  "pinterest.com", "reddit.com", "quora.com",
  "cooking.com", "allrecipes.com", "food.com",
];

function isUntrustedDomain(link: string): boolean {
  try {
    const host = new URL(link).hostname.replace("www.", "");
    return UNTRUSTED_DOMAINS.some((d) => host === d || host.endsWith("." + d));
  } catch {
    return false;
  }
}

/** Needs 2+ results with a real snippet (>80 chars) from a non-entertainment domain. */
export function hasTrustedContent(
  results: { title: string; snippet: string; link: string }[]
): boolean {
  if (results.length === 0) return false;
  const trusted = results.filter(
    (r) => r.snippet?.trim().length > 80 && !isUntrustedDomain(r.link)
  );
  return trusted.length >= 2;
}
