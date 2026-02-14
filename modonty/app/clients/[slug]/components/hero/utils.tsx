import { type ReactElement } from "react";
import { Linkedin, Twitter, Facebook } from "lucide-react";

export function getSocialPlatform(url: string): { name: string; icon: ReactElement } | null {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("linkedin.com")) return { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" /> };
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) return { name: "Twitter", icon: <Twitter className="h-5 w-5" /> };
  if (lowerUrl.includes("facebook.com")) return { name: "Facebook", icon: <Facebook className="h-5 w-5" /> };
  return null;
}

export function getCoverImage(client: {
  ogImageMedia?: { url: string } | null;
  twitterImageMedia?: { url: string } | null;
  logoMedia?: { url: string } | null;
}): string | undefined {
  return client.ogImageMedia?.url || client.twitterImageMedia?.url || client.logoMedia?.url;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getTagline(client: {
  businessBrief?: string | null;
  industry?: { name: string } | null;
  addressCity?: string | null;
  addressRegion?: string | null;
  addressCountry?: string | null;
}): string | null {
  const location = [client.addressCity, client.addressRegion, client.addressCountry]
    .filter(Boolean)
    .join("، ");
  return (
    client.businessBrief ||
    [client.industry?.name, location].filter(Boolean).join(" · ") ||
    null
  );
}
