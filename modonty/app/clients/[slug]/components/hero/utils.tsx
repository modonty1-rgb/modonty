import { type ReactElement } from "react";
import { IconLinkedin, IconTwitter, IconFacebook } from "@/lib/icons";

export function getSocialPlatform(url: string): { name: string; icon: ReactElement } | null {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("linkedin.com")) return { name: "LinkedIn", icon: <IconLinkedin className="h-5 w-5" /> };
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) return { name: "Twitter", icon: <IconTwitter className="h-5 w-5" /> };
  if (lowerUrl.includes("facebook.com")) return { name: "Facebook", icon: <IconFacebook className="h-5 w-5" /> };
  return null;
}

export function getCoverImage(client: {
  heroImageMedia?: { url: string } | null;
}): string | undefined {
  // Only use dedicated cover image — logo is not suitable for 6:1 banner ratio
  return client.heroImageMedia?.url;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const COUNTRY_CODES: Record<string, string> = {
  SA: "السعودية",
  AE: "الإمارات",
  EG: "مصر",
  KW: "الكويت",
  QA: "قطر",
  BH: "البحرين",
  OM: "عُمان",
  JO: "الأردن",
  LB: "لبنان",
};

export function localizeCountry(code: string | null | undefined): string | null {
  if (!code) return null;
  return COUNTRY_CODES[code.toUpperCase()] ?? code;
}

export function getTagline(client: {
  slogan?: string | null;
  industry?: { name: string } | null;
  addressCity?: string | null;
  addressRegion?: string | null;
  addressCountry?: string | null;
}): string | null {
  const country = localizeCountry(client.addressCountry);
  const location = [client.addressCity, client.addressRegion, country]
    .filter(Boolean)
    .join("، ");
  return (
    client.slogan ||
    [client.industry?.name, location].filter(Boolean).join(" · ") ||
    null
  );
}
