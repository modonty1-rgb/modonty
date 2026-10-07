import { absoluteUrl } from "@modonty/shared/lib/seo/absolute-url";

export function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return absoluteUrl(u, siteUrl);
  return `https://${u}`;
}
