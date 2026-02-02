import type { PageKey } from "../actions/generate-home-and-list-page-seo";

export type InspectType = "meta" | "jsonld" | "report";

export const FIELD_MAP: Record<
  PageKey,
  { meta: string; jsonld: string; report: string }
> = {
  home: {
    meta: "homeMetaTags",
    jsonld: "jsonLdStructuredData",
    report: "jsonLdValidationReport",
  },
  clients: {
    meta: "clientsPageMetaTags",
    jsonld: "clientsPageJsonLdStructuredData",
    report: "clientsPageJsonLdValidationReport",
  },
  categories: {
    meta: "categoriesPageMetaTags",
    jsonld: "categoriesPageJsonLdStructuredData",
    report: "categoriesPageJsonLdValidationReport",
  },
  trending: {
    meta: "trendingPageMetaTags",
    jsonld: "trendingPageJsonLdStructuredData",
    report: "trendingPageJsonLdValidationReport",
  },
};

export const FEEDS_MAP: Record<PageKey, Record<InspectType, string>> = {
  home: {
    meta: "Settings + modontySeoTitle, modontySeoDescription",
    jsonld: "Settings + up to 20 articles (ItemList)",
    report: "Validation result from last generation",
  },
  clients: {
    meta: "Settings + clientsSeoTitle, clientsSeoDescription",
    jsonld: "Settings + client list",
    report: "Validation result from last generation",
  },
  categories: {
    meta: "Settings + categoriesSeoTitle, categoriesSeoDescription",
    jsonld: "Settings + category list",
    report: "Validation result from last generation",
  },
  trending: {
    meta: "Settings + trendingSeoTitle, trendingSeoDescription",
    jsonld: "Settings + trending articles",
    report: "Validation result from last generation",
  },
};

export const PAGE_LABELS: Record<PageKey, string> = {
  home: "Home",
  clients: "Clients",
  categories: "Categories",
  trending: "Trending",
};

export const TYPE_LABELS: Record<InspectType, string> = {
  meta: "Meta Tags",
  jsonld: "JSON-LD",
  report: "Validation Report",
};

export function getSourceMeta(page: PageKey, type: InspectType) {
  const field = FIELD_MAP[page]?.[type] ?? null;
  const feeds = FEEDS_MAP[page]?.[type] ?? "Settings";
  return {
    field: field ? `Settings.${field}` : null,
    feeds,
  };
}
