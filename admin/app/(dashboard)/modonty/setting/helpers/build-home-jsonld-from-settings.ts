/**
 * Build home page @graph JSON-LD from Settings + articles (PRD spec Section 4 → Section 6).
 * Output: Organization, WebSite, CollectionPage, ItemList (up to 20 Articles).
 */

import { absoluteUrl, entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { buildListAuthorNode } from "@/lib/seo/build-list-author-node";
import { requireSiteUrl } from "@modonty/shared/lib/seo/require-site-url";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";

export interface SettingsForHomeJsonLd {
  siteUrl?: string | null;
  siteName?: string | null;
  brandDescription?: string | null;
  inLanguage?: string | null;
  modontySeoTitle?: string | null;
  modontySeoDescription?: string | null;
  clientsSeoTitle?: string | null;
  clientsSeoDescription?: string | null;
  categoriesSeoTitle?: string | null;
  categoriesSeoDescription?: string | null;
  trendingSeoTitle?: string | null;
  trendingSeoDescription?: string | null;
  tagsSeoTitle?: string | null;
  tagsSeoDescription?: string | null;
  industriesSeoTitle?: string | null;
  industriesSeoDescription?: string | null;
  logoUrl?: string | null;
  ogImageUrl?: string | null;
  orgContactType?: string | null;
  orgContactEmail?: string | null;
  orgContactTelephone?: string | null;
  orgContactAvailableLanguage?: string | null;
  orgContactOption?: string | null;
  orgContactHoursAvailable?: string | null;
  orgAreaServed?: string | null;
  orgStreetAddress?: string | null;
  orgAddressLocality?: string | null;
  orgAddressRegion?: string | null;
  orgAddressCountry?: string | null;
  orgPostalCode?: string | null;
  orgGeoLatitude?: number | null;
  orgGeoLongitude?: number | null;
  orgSearchUrlTemplate?: string | null;
  sameAs?: string[] | null;
}

export interface ArticleForHomeJsonLd {
  title: string;
  slug: string;
  excerpt?: string | null;
  datePublished: Date | string | null;
  dateModified?: Date | string | null;
  wordCount?: number | null;
  inLanguage?: string | null;
  featuredImage?: { url?: string | null; bunnyUrl: string | null; blurDataURL: string | null } | null;
  client: { name: string; slug: string; logoMedia?: { url?: string | null; bunnyUrl: string | null; blurDataURL: string | null } | null };
  author: { name: string; slug?: string | null };
  category?: { name: string; slug?: string } | null;
  tags?: { name: string }[];
}

function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return absoluteUrl(u, siteUrl);
  return `https://${u}`;
}

/** Normalize a country value to ISO 3166-1 alpha-2 (schema.org recommended). Maps known full names; upper-cases 2-letter codes. */
function normalizeCountryToISO(raw: string | null | undefined): string | undefined {
  const v = (raw ?? "").trim();
  if (!v) return undefined;
  const map: Record<string, string> = {
    "المملكة العربية السعودية": "SA",
    "السعودية": "SA",
    "saudi arabia": "SA",
    "ksa": "SA",
    "مصر": "EG",
    "egypt": "EG",
  };
  const hit = map[v.toLowerCase()] ?? map[v];
  if (hit) return hit;
  if (/^[A-Za-z]{2}$/.test(v)) return v.toUpperCase();
  return v;
}

// REMOVED: a hard-coded ALWAYS_OPEN_24_7 block that was attached as `hoursAvailable` to
// the Organization contact point on the home page and on every list page. It declared the
// contact reachable 00:00–23:59 on all seven days — a support-availability claim written
// in code, with no Settings field behind it and nobody able to correct it from the admin
// screen. Contact hours are published only once a stored value supplies them.
// Google: "Your structured data must be a true representation of the page content."
// https://developers.google.com/search/docs/appearance/structured-data/sd-policies

/** Parse language string to BCP 47 format: single string or array for multiple. */
function parseLanguageCodes(raw: string | null | undefined, fallback = "ar"): string | string[] {
  const val = (raw ?? fallback).trim();
  if (!val) return fallback;
  const parts = val
    .split(",")
    .map((p) => (p.trim().split("_")[0] || p.trim()).trim())
    .filter(Boolean);
  const codes = [...new Set(parts)];
  if (codes.length === 0) return fallback;
  if (codes.length === 1) return codes[0];
  return codes;
}

const SCHEMA_CONTEXT = "https://schema.org";

export function buildHomeJsonLdFromSettings(
  settings: SettingsForHomeJsonLd,
  articles: ArticleForHomeJsonLd[],
  totalArticleCount: number
): object {
  const siteUrl = requireSiteUrl(settings.siteUrl).replace(/\/$/, "");
  const { organization: orgId, website: websiteId } = buildSiteEntityIds(siteUrl);
  const collectionPageId = absoluteUrl("/#collectionpage", siteUrl);

  // The newest content date among the articles this page lists — the only date the homepage
  // can honestly claim. Unparseable and absent values are skipped rather than treated as 0,
  // which would silently make the oldest possible date win.
  const homeDateModified = articles.reduce<string | null>((newest, a) => {
    if (!a.dateModified) return newest;
    const t = new Date(a.dateModified).getTime();
    if (Number.isNaN(t)) return newest;
    return !newest || t > new Date(newest).getTime() ? new Date(t).toISOString() : newest;
  }, null);
  const inLangCodes = parseLanguageCodes(settings.inLanguage);
  const availLangCodes = parseLanguageCodes(
    settings.orgContactAvailableLanguage ?? settings.inLanguage
  );
  const siteName = settings.siteName?.trim() || "Modonty";
  const name = settings.modontySeoTitle?.trim() || siteName;
  const description = settings.modontySeoDescription?.trim() || settings.brandDescription?.trim() || "";
  const logoUrl = (settings.logoUrl ?? "").trim() || (settings.ogImageUrl ?? "").trim();
  const absLogo = logoUrl ? ensureAbsoluteUrl(logoUrl, siteUrl) : undefined;
  const ogImageUrl = (settings.ogImageUrl ?? settings.logoUrl ?? "").trim();
  const absOgImage = ogImageUrl ? ensureAbsoluteUrl(ogImageUrl, siteUrl) : undefined;

  const sameAs: string[] = Array.isArray(settings.sameAs)
    ? settings.sameAs.filter((u): u is string => typeof u === "string" && u.trim().length > 0).map((u) => u.trim())
    : [];

  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": orgId,
    name: siteName,
    url: siteUrl,
    description: settings.brandDescription?.trim() ?? "",
    sameAs,
  };
  if (absLogo) {
    org.logo = { "@type": "ImageObject", url: absLogo };
  }
  if (
    settings.orgContactType ||
    settings.orgContactEmail ||
    settings.orgContactTelephone ||
    settings.orgAreaServed
  ) {
    org.contactPoint = {
      "@type": "ContactPoint",
      ...(settings.orgContactType && { contactType: settings.orgContactType }),
      ...(settings.orgContactEmail && { email: settings.orgContactEmail }),
      ...(settings.orgContactTelephone && { telephone: settings.orgContactTelephone }),
      ...(settings.orgAreaServed && { areaServed: settings.orgAreaServed }),
      availableLanguage: availLangCodes,
      ...(settings.orgContactOption?.trim() && { contactOption: settings.orgContactOption.trim() }),
    };
  }

  const hasAddress =
    settings.orgStreetAddress ||
    settings.orgAddressLocality ||
    settings.orgAddressCountry;
  const hasGeo =
    settings.orgGeoLatitude != null &&
    settings.orgGeoLongitude != null &&
    !Number.isNaN(settings.orgGeoLatitude) &&
    !Number.isNaN(settings.orgGeoLongitude);

  // Google Organization spec: the postal address goes DIRECTLY on the Organization (not nested under location).
  if (hasAddress) {
    const isoCountry = normalizeCountryToISO(settings.orgAddressCountry);
    org.address = {
      "@type": "PostalAddress",
      ...(settings.orgStreetAddress && { streetAddress: settings.orgStreetAddress }),
      ...(settings.orgAddressLocality && { addressLocality: settings.orgAddressLocality }),
      ...(settings.orgAddressRegion && { addressRegion: settings.orgAddressRegion }),
      ...(settings.orgPostalCode && { postalCode: settings.orgPostalCode }),
      ...(isoCountry && { addressCountry: isoCountry }),
    };
  }
  // GeoCoordinates isn't a direct Organization property — expose via a minimal Place only when coords exist.
  if (hasGeo) {
    org.location = {
      "@type": "Place",
      geo: {
        "@type": "GeoCoordinates",
        latitude: settings.orgGeoLatitude,
        longitude: settings.orgGeoLongitude,
      },
    };
  }

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": websiteId,
    name: siteName,
    url: siteUrl,
    description: settings.brandDescription?.trim() ?? "",
    inLanguage: inLangCodes,
    publisher: { "@id": orgId },
  };
  // Sitelinks Searchbox (WebSite SearchAction) was deprecated by Google in Nov 2024 — intentionally not emitted.

  const itemListElements = articles.slice(0, 20).map((article, index) => {
    const articleUrl = entityUrl("articles", article.slug, siteUrl);
    const clientUrl = entityUrl("clients", article.client.slug, siteUrl);
    const authorUrl = article.author.slug ? entityUrl("authors", article.author.slug, siteUrl) : undefined;
    const imageUrl = mediaSrc(article.featuredImage)?.trim();
    const absImage = imageUrl ? ensureAbsoluteUrl(imageUrl, siteUrl) : undefined;
    const clientLogo = mediaSrc(article.client.logoMedia)?.trim();
    const absClientLogo = clientLogo ? ensureAbsoluteUrl(clientLogo, siteUrl) : undefined;

    const articleNode: Record<string, unknown> = {
      "@type": "Article",
      "@id": articleUrl,
      name: article.title,
      headline: article.title,
      description: (article.excerpt ?? "").trim() || undefined,
      url: articleUrl,
      mainEntityOfPage: articleUrl,
      datePublished:
        article.datePublished instanceof Date
          ? article.datePublished.toISOString()
          : typeof article.datePublished === "string"
            ? article.datePublished
            : undefined,
      ...(article.dateModified && {
        dateModified:
          article.dateModified instanceof Date
            ? article.dateModified.toISOString()
            : String(article.dateModified),
      }),
      author: buildListAuthorNode(article.author, siteUrl),
      publisher: {
        "@type": "Organization",
        name: article.client.name,
        url: clientUrl,
        ...(absClientLogo && { logo: absClientLogo }),
      },
      ...(article.category?.name && { articleSection: article.category.name }),
      ...(article.tags?.length && {
        keywords: article.tags.map((t) => t.name).join(", "),
      }),
      ...(article.wordCount != null && { wordCount: article.wordCount }),
      ...(article.inLanguage && { inLanguage: article.inLanguage }),
      ...(absImage && {
        image: {
          "@type": "ImageObject",
          url: absImage,
        },
      }),
    };
    return {
      "@type": "ListItem",
      position: index + 1,
      item: articleNode,
    };
  });

  const itemList: Record<string, unknown> = {
    "@type": "ItemList",
    itemListOrder: "ItemListOrderDescending",
    numberOfItems: totalArticleCount,
    itemListElement: itemListElements,
  };

  const collectionPage: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": collectionPageId,
    name,
    url: siteUrl,
    description: description || undefined,
    inLanguage: inLangCodes,
    isPartOf: { "@id": websiteId },
    // Derived from the articles on the page, never `new Date()`. This was
    // `dateModified: new Date().toISOString()`, so the homepage told Google it changed at the
    // exact moment the blob was rebuilt — including rebuilds triggered by an unrelated
    // settings save. Google uses lastmod only "if it's consistently and verifiably accurate".
    // The honest value is the newest content date among the articles listed here; with no
    // articles there is nothing to date, so the property is omitted.
    ...(homeDateModified ? { dateModified: homeDateModified } : {}),
    mainEntity: itemList,
    // No `breadcrumb`. The home page has no trail to describe: it IS the top of the site.
    //
    // What stood here was a two-item BreadcrumbList whose BOTH items carried `"@id": siteUrl`
    // — position 1 «الرئيسية» and position 2 «أحدث المقالات», the same URL twice. A breadcrumb
    // is an ordered path between distinct pages, so that markup claimed a journey from a page
    // to itself.
    //
    // Google, Breadcrumb structured data (checked 27 Aug 2026): "A breadcrumb trail on a page
    // indicates the page's position in the site hierarchy", and "It is not required to include
    // a breadcrumb `ListItem` for the top level path (your site's domain or host name), nor for
    // the page itself." On the home page those two exclusions cover every item there was, so
    // the correct list is no list.
    //
    // The LISTING pages keep theirs (see buildListPageJsonLdFromSettings below): «الرئيسية» →
    // the page, two genuinely different URLs, which is exactly the trail this type describes.
  };
  if (absOgImage) {
    collectionPage.primaryImageOfPage = {
      "@type": "ImageObject",
      url: absOgImage,
    };
  }

  const graph = [org, website, collectionPage];
  return { "@context": SCHEMA_CONTEXT, "@graph": graph };
}

export type ListPageType = "clients" | "categories" | "trending";

const LIST_PAGE_FALLBACKS: Record<
  ListPageType,
  { path: string; name: string; description: string }
> = {
  clients: {
    path: "/clients",
    name: "العملاء - دليل الشركات والمؤسسات",
    description: "استكشف دليل شامل للشركات والمؤسسات الرائدة.",
  },
  categories: {
    path: "/categories",
    name: "الفئات",
    description: "استكشف المقالات حسب الفئة.",
  },
  trending: {
    path: "/trending",
    name: "الأكثر رواجاً",
    description: "استكشف المقالات الأكثر رواجاً.",
  },
};

export function buildListPageJsonLdFromSettings(
  settings: SettingsForHomeJsonLd,
  pageType: ListPageType
): object {
  const siteUrl = requireSiteUrl(settings.siteUrl).replace(/\/$/, "");
  const fallback = LIST_PAGE_FALLBACKS[pageType];
  const nameMap = {
    clients: settings.clientsSeoTitle,
    categories: settings.categoriesSeoTitle,
    trending: settings.trendingSeoTitle,
  } as const;
  const descMap = {
    clients: settings.clientsSeoDescription,
    categories: settings.categoriesSeoDescription,
    trending: settings.trendingSeoDescription,
  } as const;
  const meta = {
    ...fallback,
    name: nameMap[pageType]?.trim() || fallback.name,
    description: descMap[pageType]?.trim() || fallback.description,
  };
  const pageUrl = absoluteUrl(meta.path, siteUrl);
  const { organization: orgId, website: websiteId } = buildSiteEntityIds(siteUrl);
  const collectionPageId = `${pageUrl}#collectionpage`;
  const inLangCodes = parseLanguageCodes(settings.inLanguage);
  const availLangCodes = parseLanguageCodes(
    settings.orgContactAvailableLanguage ?? settings.inLanguage
  );
  const siteName = settings.siteName?.trim() || "Modonty";
  const logoUrl = (settings.logoUrl ?? "").trim() || (settings.ogImageUrl ?? "").trim();
  const absLogo = logoUrl ? ensureAbsoluteUrl(logoUrl, siteUrl) : undefined;
  const ogImageUrl = (settings.ogImageUrl ?? settings.logoUrl ?? "").trim();
  const absOgImage = ogImageUrl ? ensureAbsoluteUrl(ogImageUrl, siteUrl) : undefined;

  const sameAsList: string[] = Array.isArray(settings.sameAs)
    ? settings.sameAs.filter((u): u is string => typeof u === "string" && u.trim().length > 0).map((u) => u.trim())
    : [];

  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": orgId,
    name: siteName,
    url: siteUrl,
    description: settings.brandDescription?.trim() ?? "",
    sameAs: sameAsList,
  };
  if (absLogo) org.logo = { "@type": "ImageObject", url: absLogo };
  if (
    settings.orgContactType ||
    settings.orgContactEmail ||
    settings.orgContactTelephone ||
    settings.orgAreaServed
  ) {
    org.contactPoint = {
      "@type": "ContactPoint",
      ...(settings.orgContactType && { contactType: settings.orgContactType }),
      ...(settings.orgContactEmail && { email: settings.orgContactEmail }),
      ...(settings.orgContactTelephone && { telephone: settings.orgContactTelephone }),
      ...(settings.orgAreaServed && { areaServed: settings.orgAreaServed }),
      availableLanguage: availLangCodes,
      ...(settings.orgContactOption?.trim() && { contactOption: settings.orgContactOption.trim() }),
    };
  }

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": websiteId,
    name: siteName,
    url: siteUrl,
    description: settings.brandDescription?.trim() ?? "",
    inLanguage: inLangCodes,
    publisher: { "@id": orgId },
  };

  const collectionPage: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": collectionPageId,
    name: meta.name,
    url: pageUrl,
    description: meta.description,
    inLanguage: inLangCodes,
    isPartOf: { "@id": websiteId },
    // No `dateModified` at all. This builder receives only `settings` and a page type — it
    // has no content to date, so the line it replaced (`new Date().toISOString()`) was
    // literally "this page changed the instant I generated it", which was true of the blob
    // and false of the page. Omitted rather than invented; if a real content date is wanted
    // here, it has to be passed in from the rows the page actually lists.
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@id": siteUrl,
            name: "الرئيسية",
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@id": pageUrl,
            name: meta.name,
          },
        },
      ],
    },
  };
  if (absOgImage) {
    collectionPage.primaryImageOfPage = {
      "@type": "ImageObject",
      url: absOgImage,
    };
  }

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [org, website, collectionPage],
  };
}
