export type SocialPlatform =
  | "x"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "snapchat"
  | "telegram"
  | "whatsapp";

const HOSTS: ReadonlyArray<[SocialPlatform, readonly string[]]> = [
  ["x", ["x.com", "twitter.com"]],
  ["instagram", ["instagram.com"]],
  ["facebook", ["facebook.com", "fb.com"]],
  ["linkedin", ["linkedin.com"]],
  ["youtube", ["youtube.com", "youtu.be"]],
  ["tiktok", ["tiktok.com"]],
  ["snapchat", ["snapchat.com"]],
  ["telegram", ["t.me", "telegram.me"]],
  ["whatsapp", ["wa.me", "whatsapp.com"]],
];

/**
 * Which network a `Client.sameAs` URL belongs to, by hostname — so the footer can show
 * the right brand icon. Unknown hosts return null and are simply not shown as icons.
 */
export function detectSocialPlatform(url: string): SocialPlatform | null {
  let host: string;
  try {
    host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  for (const [platform, hosts] of HOSTS) {
    if (hosts.some((h) => host === h || host.endsWith(`.${h}`))) return platform;
  }
  return null;
}
