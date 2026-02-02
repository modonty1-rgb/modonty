/**
 * Build home page @graph JSON-LD from Settings + articles (PRD spec Section 4 → Section 6).
 * Output: Organization, WebSite, CollectionPage, ItemList (up to 20 Articles).
 */

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
  orgLogoUrl?: string | null;
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
  featuredImage?: { url?: string | null } | null;
  client: { name: string; slug: string; logoMedia?: { url?: string | null } | null };
  author: { name: string; slug?: string | null };
  category?: { name: string; slug?: string } | null;
  tags?: { name: string }[];
}

function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return `${siteUrl}${u}`;
  return `https://${u}`;
}

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
  const siteUrl = (settings.siteUrl?.trim() || "https://modonty.com").replace(/\/$/, "");
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const collectionPageId = `${siteUrl}/#collectionpage`;
  const inLangCodes = parseLanguageCodes(settings.inLanguage);
  const availLangCodes = parseLanguageCodes(
    settings.orgContactAvailableLanguage ?? settings.inLanguage
  );
  const siteName = settings.siteName?.trim() || "Modonty";
  const name = settings.modontySeoTitle?.trim() || siteName;
  const description = settings.modontySeoDescription?.trim() || settings.brandDescription?.trim() || "";
  const logoUrl = (settings.orgLogoUrl ?? settings.logoUrl ?? "").trim();
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
    org.logo = { "@type": "ImageObject", url: absLogo, width: 512, height: 512 };
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
      ...(settings.orgContactHoursAvailable?.trim() && { hoursAvailable: settings.orgContactHoursAvailable.trim() }),
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

  if (hasAddress || hasGeo) {
    const place: Record<string, unknown> = {
      "@type": "Place",
    };
    if (hasAddress) {
      place.address = {
        "@type": "PostalAddress",
        ...(settings.orgStreetAddress && { streetAddress: settings.orgStreetAddress }),
        ...(settings.orgAddressLocality && { addressLocality: settings.orgAddressLocality }),
        ...(settings.orgAddressRegion && { addressRegion: settings.orgAddressRegion }),
        ...(settings.orgPostalCode && { postalCode: settings.orgPostalCode }),
        ...(settings.orgAddressCountry && { addressCountry: settings.orgAddressCountry }),
      };
    }
    if (hasGeo) {
      place.geo = {
        "@type": "GeoCoordinates",
        latitude: settings.orgGeoLatitude,
        longitude: settings.orgGeoLongitude,
      };
    }
    org.location = place;
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
  const searchTemplate = settings.orgSearchUrlTemplate?.trim();
  if (searchTemplate) {
    website.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchTemplate.includes("{") ? searchTemplate : `${searchTemplate}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    };
  }

  const itemListElements = articles.slice(0, 20).map((article, index) => {
    const articleUrl = `${siteUrl}/articles/${article.slug}`;
    const clientUrl = `${siteUrl}/clients/${article.client.slug}`;
    const authorUrl = article.author.slug ? `${siteUrl}/authors/${article.author.slug}` : undefined;
    const imageUrl = article.featuredImage?.url?.trim();
    const absImage = imageUrl ? ensureAbsoluteUrl(imageUrl, siteUrl) : undefined;
    const clientLogo = article.client.logoMedia?.url?.trim();
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
      author: {
        "@type": "Person",
        name: article.author.name || "Modonty",
        ...(authorUrl && { url: authorUrl }),
      },
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
          width: 1200,
          height: 630,
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
    dateModified: new Date().toISOString(),
    mainEntity: itemList,
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
            "@id": siteUrl,
            name: name || "أحدث المقالات",
          },
        },
      ],
    },
  };
  if (absOgImage) {
    collectionPage.primaryImageOfPage = {
      "@type": "ImageObject",
      url: absOgImage,
      width: 1200,
      height: 630,
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
  const siteUrl = (settings.siteUrl?.trim() || "https://modonty.com").replace(/\/$/, "");
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
  const pageUrl = `${siteUrl}${meta.path}`;
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const collectionPageId = `${pageUrl}#collectionpage`;
  const inLangCodes = parseLanguageCodes(settings.inLanguage);
  const availLangCodes = parseLanguageCodes(
    settings.orgContactAvailableLanguage ?? settings.inLanguage
  );
  const siteName = settings.siteName?.trim() || "Modonty";
  const logoUrl = (settings.orgLogoUrl ?? settings.logoUrl ?? "").trim();
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
  if (absLogo) org.logo = { "@type": "ImageObject", url: absLogo, width: 512, height: 512 };
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
      ...(settings.orgContactHoursAvailable?.trim() && { hoursAvailable: settings.orgContactHoursAvailable.trim() }),
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
    dateModified: new Date().toISOString(),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: 0,
      itemListElement: [],
    },
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
      width: 1200,
      height: 630,
    };
  }

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [org, website, collectionPage],
  };
}
