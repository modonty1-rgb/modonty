import type { HeaderData } from "@modonty/shared/components/partner-site/free/header";
import type { FooterData } from "@modonty/shared/components/partner-site/free/footer";

import type { MySiteData } from "./get-my-site-data";

/**
 * The client row → what the header and footer templates take, for PREVIEW only.
 * Links are inert (`#…`): the partner is looking at his site, not browsing it — a real
 * href inside the preview frame would navigate away from the screen he is editing.
 * `primaryColor` is passed separately because the preview shows a colour he has not saved yet.
 */
export function buildPreviewChrome(
  site: MySiteData,
  primaryColor: string | null,
  year: string,
): { header: HeaderData; footer: FooterData } {
  const { chrome } = site;
  const links = site.pages.map((label, i) => ({ href: `#page-${i}`, label }));
  const common = {
    name: chrome.name,
    tagline: chrome.tagline,
    logoUrl: chrome.logoUrl,
    phone: chrome.phone,
    email: chrome.email,
    primaryColor,
  };
  return {
    header: { ...common, links },
    footer: {
      ...common,
      description: chrome.description,
      address: chrome.address,
      services: chrome.services.map((label, i) => ({ href: `#service-${i}`, label })),
      pages: links,
      socialLinks: chrome.socialLinks,
      registrationNumber: chrome.registrationNumber,
      year,
    },
  };
}
