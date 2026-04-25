export type GscDimension = "query" | "page" | "country" | "device" | "date" | "searchAppearance";
export type GscSearchType = "web" | "image" | "video" | "news" | "discover" | "googleNews";
export type GscDevice = "desktop" | "mobile" | "tablet";
export type GscOperator = "equals" | "notEquals" | "contains" | "notContains" | "includingRegex" | "excludingRegex";

export interface GscFilter {
  dimension: GscDimension;
  operator: GscOperator;
  expression: string;
}

export interface GscAnalyticsRequest {
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  dimensions?: GscDimension[];
  searchType?: GscSearchType;
  filters?: GscFilter[];
  rowLimit?: number;       // max 25000
  startRow?: number;
}

export interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscAnalyticsResponse {
  rows: GscRow[];
  responseAggregationType?: string;
}

export interface GscSitemap {
  path: string;
  lastSubmitted?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  type?: string;
  lastDownloaded?: string;
  warnings?: string;
  errors?: string;
  contents?: Array<{ type: string; submitted: string; indexed: string }>;
}

export interface GscUrlInspectionResult {
  inspectionUrl: string;
  indexStatusResult?: {
    verdict: string;
    coverageState: string;
    robotsTxtState: string;
    indexingState: string;
    lastCrawlTime?: string;
    pageFetchState?: string;
    googleCanonical?: string;
    userCanonical?: string;
    sitemap?: string[];
    referringUrls?: string[];
    crawledAs?: string;
  };
  mobileUsabilityResult?: {
    verdict: string;
    issues?: Array<{ issueType: string; severity: string; message: string }>;
  };
  richResultsResult?: {
    verdict: string;
    detectedItems?: Array<{ richResultType: string; items: Array<{ name: string; issues: unknown[] }> }>;
  };
}

export interface GscSite {
  siteUrl: string;
  permissionLevel: string;
}
