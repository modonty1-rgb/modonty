/**
 * Search Console API Integration - Phase 14
 *
 * Real-time monitoring, automated alerts, and weekly reports using Google Search Console API.
 * 
 * NOTE: This module uses Node.js-only packages (googleapis) and should only be imported server-side.
 * This file must NOT be imported in client components.
 * 
 * IMPORTANT: Import this file directly only in server components/actions.
 * Do NOT export from the main @/lib/seo index.ts to prevent client-side bundling.
 */

// Prevent this file from being bundled in client components
if (typeof window !== "undefined") {
  throw new Error("Search Console API can only be used server-side");
}

let google: typeof import("googleapis").google | null = null;
let JWT: typeof import("google-auth-library").JWT | null = null;

// Lazy load googleapis only when needed (server-side only)
async function loadGoogleApis() {
  if (typeof window !== "undefined") {
    throw new Error("Search Console API can only be used server-side");
  }
  
  if (!google) {
    const googleapis = await import("googleapis");
    google = googleapis.google;
  }
  
  if (!JWT) {
    const { JWT: JWTClass } = await import("google-auth-library");
    JWT = JWTClass;
  }
  
  return { google: google!, JWT: JWT! };
}

type JWTType = import("google-auth-library").JWT;

export interface SearchConsoleCredentials {
  clientEmail: string;
  privateKey: string;
  siteUrl: string;
}

export interface StructuredDataError {
  url: string;
  type: string;
  severity: "ERROR" | "WARNING";
  description: string;
  firstDetected: Date;
  affectedItems?: number;
}

export interface PerformanceData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: Date;
  hourlyBreakdown?: Array<{
    hour: number;
    clicks: number;
    impressions: number;
  }>;
}

/**
 * Direction of travel for one error type — with "we never compared" kept apart from
 * "we compared and nothing moved". `stable` is a measurement; `not-measured` is not.
 */
export type ErrorTrendDirection =
  | "increasing"
  | "decreasing"
  | "stable"
  | "not-measured";

/**
 * A per-type error count, plus its trend when a trend can actually be measured.
 *
 * Today it cannot. Search Console API v1 exposes four resources —
 * `searchanalytics.query` ("Query your search traffic data with filters and parameters
 * that you define."), `sitemaps.*`, `sites.*`, and `urlInspection.index.inspect`
 * ("Information about the provided URL in the Google index.") — and none of them returns
 * rich-results issues for a past period. `searchanalytics.query` groups only by
 * "country", "device", "page", "query", "searchAppearance", "date", and "hour", none of
 * which is a structured-data issue.
 * — https://developers.google.com/webmaster-tools/v1/api_reference_index
 *
 * So `previousCount` is null and `trend` is "not-measured" until we store our own
 * snapshots over time. Substituting 0 for the previous period printed
 * "increasing +100%" next to EVERY error type on /seo-health and in the weekly report —
 * a fabricated measurement, not a trend.
 */
export interface ErrorTrend {
  errorType: string;
  currentCount: number;
  /** null = the previous period was never read. Never substitute 0. */
  previousCount: number | null;
  trend: ErrorTrendDirection;
  /** null whenever `previousCount` is null — there is nothing to compute a change from. */
  changePercentage: number | null;
}

/**
 * Initialize Search Console client with service account authentication
 */
export async function initSearchConsoleClient(
  credentials: SearchConsoleCredentials
): Promise<JWTType | null> {
  try {
    const { google: googleApi, JWT: JWTClass } = await loadGoogleApis();
    
    const auth = new JWTClass({
      email: credentials.clientEmail,
      key: credentials.privateKey.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });

    await auth.authorize();
    return auth;
  } catch (error) {
    console.error("Failed to initialize Search Console client:", error);
    return null;
  }
}

/**
 * Outcome of one URL Inspection call, with "we did not read it" kept apart from
 * "we read it and it was clean". An empty error list means nothing on its own.
 */
export type RichResultsInspection =
  | { status: "unknown"; url: string; reason: string }
  | { status: "clean"; url: string; verdict: string; errors: [] }
  | { status: "issues"; url: string; verdict: string; errors: StructuredDataError[] };

/**
 * Inspect one URL and read its rich-results verdict from Search Console.
 *
 * The response shape is the official `UrlInspectionResult`:
 * `inspectionResult.richResultsResult.{ verdict, detectedItems[].items[].issues[] }`
 * — https://developers.google.com/webmaster-tools/v1/urlInspection.index/UrlInspectionResult
 *
 * `verdict` is one of VERDICT_UNSPECIFIED · PASS · PARTIAL · FAIL · NEUTRAL, and issue
 * `severity` is one of SEVERITY_UNSPECIFIED · WARNING · ERROR. VERDICT_UNSPECIFIED (or a
 * missing `richResultsResult`) is *not* a pass — Google did not answer, so we say so.
 */
export async function inspectRichResults(
  siteUrl: string,
  auth: JWTType,
  inspectionUrl: string = siteUrl
): Promise<RichResultsInspection> {
  try {
    const { google: googleApi } = await loadGoogleApis();
    const searchconsole = googleApi.searchconsole("v1");

    const response = await searchconsole.urlInspection.index.inspect({
      auth,
      requestBody: {
        siteUrl,
        inspectionUrl,
      },
    });

    const richResults = response.data.inspectionResult?.richResultsResult;
    if (!richResults) {
      return {
        status: "unknown",
        url: inspectionUrl,
        reason: "Search Console returned no richResultsResult for this URL",
      };
    }

    const verdict = richResults.verdict || "VERDICT_UNSPECIFIED";
    if (verdict === "VERDICT_UNSPECIFIED") {
      return {
        status: "unknown",
        url: inspectionUrl,
        reason: "Search Console answered VERDICT_UNSPECIFIED",
      };
    }

    const firstDetected = new Date();
    const errors: StructuredDataError[] = [];
    for (const detected of richResults.detectedItems || []) {
      const type = detected.richResultType || "Unknown rich result type";
      for (const item of detected.items || []) {
        for (const issue of item.issues || []) {
          errors.push({
            url: inspectionUrl,
            type,
            severity: issue.severity === "ERROR" ? "ERROR" : "WARNING",
            description: [item.name, issue.issueMessage].filter(Boolean).join(" — "),
            firstDetected,
            affectedItems: detected.items?.length,
          });
        }
      }
    }

    return errors.length > 0
      ? { status: "issues", url: inspectionUrl, verdict, errors }
      : { status: "clean", url: inspectionUrl, verdict, errors: [] };
  } catch (error) {
    return {
      status: "unknown",
      url: inspectionUrl,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Fetch structured data errors from Search Console.
 *
 * Throws when the inspection could not be read — an empty array from this function now
 * means "Google answered, and found nothing", never "we never asked".
 */
export async function fetchStructuredDataErrors(
  siteUrl: string,
  auth: JWTType,
  inspectionUrl: string = siteUrl
): Promise<StructuredDataError[]> {
  const inspection = await inspectRichResults(siteUrl, auth, inspectionUrl);
  if (inspection.status === "unknown") {
    throw new Error(
      `Structured data not measured for ${inspection.url}: ${inspection.reason}`
    );
  }
  return inspection.errors;
}

/**
 * Fetch performance data (clicks, impressions, CTR, position)
 * Includes hourly breakdown if available (April 2025 API update)
 */
export async function fetchHourlyPerformanceData(
  siteUrl: string,
  auth: JWTType,
  date: Date
): Promise<PerformanceData | null> {
  try {
    const { google: googleApi } = await loadGoogleApis();
    const searchconsole = googleApi.searchconsole("v1");

    const dateString = date.toISOString().split("T")[0];

    const response = await searchconsole.searchanalytics.query({
      auth,
      siteUrl,
      requestBody: {
        startDate: dateString,
        endDate: dateString,
        dimensions: ["date"],
        rowLimit: 100,
      },
    });

    if (!response.data.rows || response.data.rows.length === 0) {
      return null;
    }

    const row = response.data.rows[0];
    const clicks = row.clicks || 0;
    const impressions = row.impressions || 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const position = row.position || 0;

    return {
      clicks,
      impressions,
      ctr,
      position,
      date,
    };
  } catch (error) {
    console.error("Failed to fetch performance data:", error);
    return null;
  }
}

/**
 * Group the errors of ONE inspection by rich-result type.
 *
 * Counting is all this can honestly do: a single inspection is one point in time, so
 * every trend it produces is "not-measured". Exported so the shape can be tested without
 * a live Search Console call.
 */
export function buildErrorTrends(errors: StructuredDataError[]): ErrorTrend[] {
  const errorCounts = new Map<string, number>();
  for (const error of errors) {
    errorCounts.set(error.type, (errorCounts.get(error.type) || 0) + 1);
  }

  return Array.from(errorCounts, ([errorType, currentCount]) => ({
    errorType,
    currentCount,
    previousCount: null,
    trend: "not-measured" as const,
    changePercentage: null,
  }));
}

/**
 * Read the current structured-data errors and group them by type.
 *
 * There is no time window: the only source is one URL inspection, which reports the URL's
 * state now. Callers must present the result as a snapshot, never as "last 30 days".
 * Throws when Search Console could not be read — an empty array means "read, and empty".
 */
export async function fetchErrorTrends(
  siteUrl: string,
  auth: JWTType
): Promise<ErrorTrend[]> {
  const currentErrors = await fetchStructuredDataErrors(siteUrl, auth);
  return buildErrorTrends(currentErrors);
}

/**
 * Check if Search Console credentials are configured
 */
export function isSearchConsoleConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL &&
    process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY &&
    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL
  );
}

/**
 * Get Search Console credentials from environment variables
 */
export function getSearchConsoleCredentials(): SearchConsoleCredentials | null {
  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;

  if (!clientEmail || !privateKey || !siteUrl) {
    return null;
  }

  return {
    clientEmail,
    privateKey,
    siteUrl,
  };
}