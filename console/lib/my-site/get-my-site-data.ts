import { ArticleStatus, CommentStatus } from "@prisma/client";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { DEFAULT_HEADER_TEMPLATE, type HeaderTemplateKey } from "@modonty/shared/components/partner-site/free/header";
import { DEFAULT_FOOTER_TEMPLATE, type FooterTemplateKey } from "@modonty/shared/components/partner-site/free/footer";

import { db } from "@/lib/db";

/** What the site's chrome (header · footer) shows — read-only facts for the previews. */
export interface MySiteChrome {
  name: string;
  logoUrl: string | null;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  socialLinks: string[];
  registrationNumber: string | null;
  address: string | null;
  services: string[];
}

export interface MySiteData {
  slug: string;
  chrome: MySiteChrome;
  /** Nav link labels exactly as modonty builds them (a page appears only when it has content). */
  pages: string[];
  /** The saved choices (ClientSite row) — defaults when the row does not exist yet. */
  headerTemplate: HeaderTemplateKey;
  footerTemplate: FooterTemplateKey;
  primaryColor: string | null;
  subdomain: string | null;
  updatedAt: Date | null;
}

/** Everything «إعدادات الموقع» shows, in one round of parallel queries. */
export async function getMySiteData(clientId: string): Promise<MySiteData | null> {
  const [client, approvedReviews, galleryImages, publishedArticles] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        slug: true, name: true, email: true, phone: true, description: true, sameAs: true,
        commercialRegistrationNumber: true, addressStreet: true, addressCity: true,
        industry: { select: { name: true } },
        logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
        services: { select: { title: true } },
        site: { select: { headerTemplate: true, footerTemplate: true, primaryColor: true, subdomain: true, updatedAt: true } },
      },
    }),
    db.clientReview.count({ where: { clientId, status: CommentStatus.APPROVED } }),
    db.media.count({ where: { clientId, inGallery: true, type: "GALLERY" } }),
    db.article.count({ where: { clientId, status: ArticleStatus.PUBLISHED } }),
  ]);
  if (!client) return null;

  const servicesCount = client.services.length;
  // Same order + "has content" rule as modonty `partner-nav-items.ts`; the business speaks
  // for itself in first person plural (Khalid 2026-08-17).
  const pages = [
    "الرئيسية",
    servicesCount > 0 ? "خدماتنا" : null,
    galleryImages > 0 ? "ألبوم أعمالنا" : null,
    approvedReviews > 0 ? "آراء العملاء" : null,
    "من نحن",
    publishedArticles > 0 ? "المدونة" : null,
    "تواصل معنا",
  ].filter((p): p is string => Boolean(p));

  const site = client.site;
  return {
    slug: client.slug,
    pages,
    chrome: {
      name: client.name,
      logoUrl: mediaSrc(client.logoMedia),
      tagline: [client.industry?.name, client.addressCity].filter(Boolean).join(" · ") || null,
      phone: client.phone,
      email: client.email,
      description: client.description,
      socialLinks: client.sameAs,
      registrationNumber: client.commercialRegistrationNumber,
      address: [client.addressStreet, client.addressCity].filter(Boolean).join("، ") || null,
      services: client.services.map((s) => s.title).filter(Boolean),
    },
    headerTemplate: (site?.headerTemplate as HeaderTemplateKey | undefined) ?? DEFAULT_HEADER_TEMPLATE,
    footerTemplate: (site?.footerTemplate as FooterTemplateKey | undefined) ?? DEFAULT_FOOTER_TEMPLATE,
    primaryColor: site?.primaryColor ?? null,
    subdomain: site?.subdomain ?? null,
    updatedAt: site?.updatedAt ?? null,
  };
}
