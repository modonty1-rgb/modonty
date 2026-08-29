/**
 * Generate full @graph JSON-LD for Modonty page (Organization, WebSite, WebPage, BreadcrumbList).
 * Caller passes site config from env; no env access inside.
 */

import { absoluteUrl } from "@modonty/shared/lib/seo/absolute-url";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";

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
  /** @deprecated Unused since 27 Aug 2026 — the SearchAction it fed was removed with the
   *  sitelinks search box. Kept in the shape only because `page-schema.ts:76` still parses it. */
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
  if (u.startsWith("/")) return absoluteUrl(u, siteUrl);
  return `https://${u}`;
}

function absoluteImageUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return absoluteUrl(u, siteUrl);
  return absoluteUrl(u, siteUrl);
}

export function generateModontyPageJsonLd(config: ModontySiteConfig, page: ModontyPageForJsonLd): object {
  const siteUrl = config.siteUrl.replace(/\/$/, "");
  const pageUrl = ensureAbsoluteUrl(page.canonicalUrl, siteUrl) || absoluteUrl(`/${page.slug}`, siteUrl);
  const name = (page.seoTitle || page.title || "").trim() || "Modonty";
  const description = (page.seoDescription || "").trim();
  const imageUrl = (page.ogImage || page.socialImage || page.heroImage || "").trim();
  const absImageUrl = imageUrl ? absoluteImageUrl(imageUrl, siteUrl) : undefined;
  const pageConfig = getPageConfig(page.slug);
  const pageType = page.slug === "about" ? "AboutPage" : page.slug === "contact" ? "ContactPage" : "WebPage";
  const isAboutPage = pageType === "AboutPage";
  const inLang = page.inLanguage || "ar";

  const graph: Record<string, unknown>[] = [];

  const { organization: orgId, website: websiteId } = buildSiteEntityIds(siteUrl);
  // Absent stays absent. Every line below used to publish a placeholder when Settings had
  // nothing: `description: ""` told Google the organisation describes itself as the empty
  // string, and `sameAs: []` declared "we have no profiles anywhere" as a fact. An omitted
  // property says "not stated"; an empty one is an assertion, and a false one.
  //
  // `name` kept its `|| "Modonty"` for the longest, which made this file a FOURTH place the
  // brand is spelled (see card BRAND-SPELLING). The name belongs to Settings; with no value
  // there, no name is written here.
  const orgName = config.siteName?.trim();
  const orgDescription = config.brandDescription?.trim();
  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": orgId,
    ...(orgName && { name: orgName }),
    url: siteUrl,
    ...(orgDescription && { description: orgDescription }),
    ...(config.sameAs?.length ? { sameAs: config.sameAs } : {}),
  };

  // The node itself is conditional, not just its fields. Each field was already guarded, so
  // with an unconfigured contact this assigned a bare `{"@type":"ContactPoint"}` — a contact
  // method with no way to contact anyone. It is attached only when it carries something.
  const contactPoint = {
    ...(config.contactPoint?.contactType && { contactType: config.contactPoint.contactType }),
    ...(config.contactPoint?.email && { email: config.contactPoint.email }),
    ...(config.contactPoint?.telephone && { telephone: config.contactPoint.telephone }),
    ...(config.contactPoint?.areaServed && { areaServed: config.contactPoint.areaServed }),
  };
  if (Object.keys(contactPoint).length > 0) {
    org.contactPoint = { "@type": "ContactPoint", ...contactPoint };
  }
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

  // No WebSite node here. This builder serves inner content pages (/about, /contact, /terms,
  // the legal pages), and Google is explicit: "The WebSite structured data must be on the home
  // page of the site … you only need to add this markup to the home page of your site"
  // (developers.google.com/search/docs/appearance/site-names).
  //
  // Nothing is lost: `webPage.isPartOf` below already points at `websiteId`, which is a
  // reference to the entity the home page defines — the correct cross-page pattern. The node
  // object that used to be assembled here had no other consumer, so it is gone rather than
  // left dangling. (Its SearchAction block went on 27 Aug 2026 — the sitelinks search box it
  // fed is retired, "no longer available", Google Search Central changelog, 29 Nov 2024.)
  // Removed 28 Aug 2026.

  const pageNodeId = `${pageUrl}#${pageType.toLowerCase()}`;
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
    // No `|| new Date()`. A content page with no stored `updatedAt` has no known modified
    // date, and inventing "now" made every regeneration look like an edit to the page. The
    // property is omitted instead — the same rule the article generator applies to
    // `article:published_time`.
    ...(page.updatedAt ? { dateModified: page.updatedAt.toISOString() } : {}),
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
  if (pageConfig) {
    webPage.breadcrumb = { "@id": `${pageUrl}#breadcrumb` };
  }
  graph.push(webPage);

  if (pageConfig) {
    const breadcrumb: Record<string, unknown> = {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListOrder: "ItemListOrderAscending",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          // "الرئيسية", not the brand name: a breadcrumb crumb is a place on the site, and
          // every other breadcrumb here says الرئيسية. `Settings.siteName` is the Latin
          // "Modonty", so this crumb rendered a Latin word inside an Arabic trail —
          // measured 25 Aug 2026, and the same defect SEOBC-EN fixed on the taxonomy pages.
          name: "الرئيسية",
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
