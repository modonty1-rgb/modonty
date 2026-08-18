import { mediaSrc } from "@modonty/shared/lib/media-src";
import type { HeaderData } from "@modonty/shared/components/partner-site/free/header";
import type { FooterData } from "@modonty/shared/components/partner-site/free/footer";
import { getWhatsAppLink, bookingWhatsappMessage } from "@/lib/whatsapp";
import type { PartnerSite } from "./get-partner-site";

/** The site's menu — a link exists only when its page has content. First-person labels (the business speaks). */
export function buildSiteLinks(site: PartnerSite): { href: string; label: string }[] {
  const base = `/clients/${encodeURIComponent(site.slug)}`;
  const items = [{ href: base, label: "الرئيسية" }];
  if (site.services.length > 0) items.push({ href: `${base}/services`, label: "خدماتنا" });
  if (site._count.media > 0) items.push({ href: `${base}/photos`, label: "أعمالنا" });
  if (site._count.reviews > 0) items.push({ href: `${base}/reviews`, label: "آراء العملاء" });
  items.push({ href: `${base}/about`, label: "من نحن" });
  if (site._count.articles > 0) items.push({ href: `${base}/articles`, label: "المدونة" });
  if (site._count.clientFaqs > 0) items.push({ href: `${base}/faq`, label: "الأسئلة الشائعة" });
  items.push({ href: `${base}/contact`, label: "تواصل معنا" });
  return items;
}

/** One place that turns the client row into what the shared header/footer take. Same shape the console previews use. */
export function buildChromeData(site: PartnerSite, year: string): { header: HeaderData; footer: FooterData } {
  const base = `/clients/${encodeURIComponent(site.slug)}`;
  const links = buildSiteLinks(site);
  const whatsappHref = site.phone ? getWhatsAppLink(site.phone, bookingWhatsappMessage(site.name)) : null;
  const primaryColor = site.site?.primaryColor ?? null;
  const common = {
    name: site.name,
    tagline: [site.industry?.name, site.addressCity].filter(Boolean).join(" · ") || null,
    logoUrl: mediaSrc(site.logoMedia),
    homeHref: base,
    phone: site.phone,
    email: site.email,
    whatsappHref,
    primaryColor,
  };
  return {
    header: { ...common, links },
    footer: {
      ...common,
      description: site.description,
      address: [site.addressStreet, site.addressCity].filter(Boolean).join("، ") || null,
      services: site.services.filter((s) => s.title?.trim()).map((s) => ({ href: `${base}/services`, label: s.title })),
      pages: links,
      socialLinks: site.sameAs,
      registrationNumber: site.commercialRegistrationNumber,
      privacyHref: "/legal/privacy-policy",
      year,
    },
  };
}
