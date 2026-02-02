/**
 * Generate full @graph JSON-LD for Modonty page (Organization, WebSite, WebPage/AboutPage, BreadcrumbList).
 * Caller passes site config from env; no env access inside.
 */

import { getPageConfig } from "./page-config";

export interface ModontySiteConfig {
  siteUrl: string;
  siteName: string;
  brandDescription?: string;
  sameAs?: string[];
  contactPoint?: {
    contactType?: string;
    email?: string;
    telephone?: string;
    areaServed?: string;
  };
  logo?: string;
  knowsLanguage?: string[];
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
    postalCode?: string;
  };
  geo?: { latitude: number; longitude: number };
  searchUrlTemplate?: string;
  areaServed?: string;
}

export interface ModontyPageForJsonLd {
  slug: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  inLanguage: string;
  socialImage: string | null;
  ogImage: string | null;
  heroImage?: string | null;
  socialImageAlt?: string | null;
  updatedAt: Date;
}

const SCHEMA_CONTEXT = "https://schema.org";

function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return `${siteUrl}${u}`;
  return `https://${u}`;
}

function absoluteImageUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return `${siteUrl}${u}`;
  return `${siteUrl}/${u}`;
}

export function generateModontyPageJsonLd(config: ModontySiteConfig, page: ModontyPageForJsonLd): object {
  const siteUrl = config.siteUrl.replace(/\/$/, "");
  const pageUrl = ensureAbsoluteUrl(page.canonicalUrl, siteUrl) || `${siteUrl}/${page.slug}`;
  const name = (page.seoTitle || page.title || "").trim() || "Modonty";
  const description = (page.seoDescription || "").trim();
  const imageUrl = (page.ogImage || page.socialImage || page.heroImage || "").trim();
  const absImageUrl = imageUrl ? absoluteImageUrl(imageUrl, siteUrl) : undefined;
  const pageConfig = getPageConfig(page.slug);
  const isAboutPage = !!pageConfig;
  const inLang = page.inLanguage || "ar";

  const graph: Record<string, unknown>[] = [];

  const orgId = `${siteUrl}#organization`;
  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": orgId,
    name: config.siteName || "Modonty",
    url: siteUrl,
    description: config.brandDescription ?? "",
    sameAs: config.sameAs ?? [],
  };
  org.contactPoint = {
    "@type": "ContactPoint",
    ...(config.contactPoint?.contactType && { contactType: config.contactPoint.contactType }),
    ...(config.contactPoint?.email && { email: config.contactPoint.email }),
    ...(config.contactPoint?.telephone && { telephone: config.contactPoint.telephone }),
    ...(config.contactPoint?.areaServed && { areaServed: config.contactPoint.areaServed }),
  };
  if (config.logo) {
    org.logo = {
      "@type": "ImageObject",
      url: absoluteImageUrl(config.logo, siteUrl) || config.logo,
      width: 512,
      height: 512,
    };
  }
  if (absImageUrl) {
    org.image = {
      "@type": "ImageObject",
      url: absImageUrl,
      width: 1200,
      height: 630,
    };
  }
  if (config.knowsLanguage?.length) org.knowsLanguage = config.knowsLanguage;
  else org.knowsLanguage = [inLang];
  if (config.address && (config.address.streetAddress || config.address.addressCountry)) {
    org.address = {
      "@type": "PostalAddress",
      ...(config.address.streetAddress && { streetAddress: config.address.streetAddress }),
      ...(config.address.addressLocality && { addressLocality: config.address.addressLocality }),
      ...(config.address.addressRegion && { addressRegion: config.address.addressRegion }),
      ...(config.address.addressCountry && { addressCountry: config.address.addressCountry }),
      ...(config.address.postalCode && { postalCode: config.address.postalCode }),
    };
  }
  graph.push(org);

  const websiteId = `${siteUrl}#website`;
  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": websiteId,
    name: config.siteName || "Modonty",
    url: siteUrl,
    description: config.brandDescription ?? "",
    inLanguage: inLang,
    publisher: { "@id": orgId },
  };
  if (config.searchUrlTemplate?.trim()) {
    website.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: config.searchUrlTemplate.trim(),
      },
      "query-input": "required name=search_term_string",
    };
  }
  graph.push(website);

  const pageType = isAboutPage ? "AboutPage" : "WebPage";
  const pageNodeId = isAboutPage ? `${pageUrl}#aboutpage` : `${pageUrl}#webpage`;
  const webPage: Record<string, unknown> = {
    "@type": pageType,
    "@id": pageNodeId,
    name,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    description: description ?? "",
    publisher: { "@id": orgId },
    isPartOf: { "@id": websiteId },
    inLanguage: inLang,
    dateModified: page.updatedAt?.toISOString?.() || new Date().toISOString(),
  };
  if (isAboutPage) {
    webPage.headline = name;
    webPage.about = { "@id": orgId };
  }
  if (absImageUrl) {
    webPage.primaryImageOfPage = {
      "@type": "ImageObject",
      url: absImageUrl,
      width: 1200,
      height: 630,
    };
  }
  if (isAboutPage) {
    webPage.breadcrumb = { "@id": `${pageUrl}#breadcrumb` };
  }
  graph.push(webPage);

  if (isAboutPage && pageConfig) {
    const breadcrumb: Record<string, unknown> = {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListOrder: "ItemListOrderAscending",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: config.siteName || "Modonty",
          item: { "@id": siteUrl },
        },
        {
          "@type": "ListItem",
          position: 2,
          name: pageConfig.label || name,
          item: { "@id": pageUrl },
        },
      ],
    };
    graph.push(breadcrumb);
  }

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": graph,
  };
}
