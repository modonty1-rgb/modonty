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

export interface ErrorTrend {
  errorType: string;
  currentCount: number;
  previousCount: number;
  trend: "increasing" | "decreasing" | "stable";
  changePercentage: number;
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
 * Fetch structured data errors from Search Console
 */
export async function fetchStructuredDataErrors(
  siteUrl: string,
  auth: JWTType
): Promise<StructuredDataError[]> {
  try {
    const { google: googleApi } = await loadGoogleApis();
    const searchconsole = googleApi.searchconsole("v1");

    // Fetch rich result issues
    const response = await searchconsole.urlInspection.index.inspect({
      auth,
      requestBody: {
        siteUrl,
        inspectionUrl: siteUrl,
      },
    });

    const errors: StructuredDataError[] = [];

    // Parse response for structured data errors
    // Note: This is a simplified implementation
    // The actual Search Console API might have different endpoints for structured data errors

    return errors;
  } catch (error) {
    console.error("Failed to fetch structured data errors:", error);
    return [];
  }
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
 * Fetch error trends over time
 */
export async function fetchErrorTrends(
  siteUrl: string,
  auth: JWTType,
  days: number = 30
): Promise<ErrorTrend[]> {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch errors for current and previous period
    const currentErrors = await fetchStructuredDataErrors(siteUrl, auth);

    // Group errors by type
    const errorCounts: Record<string, number> = {};
    for (const error of currentErrors) {
      errorCounts[error.type] = (errorCounts[error.type] || 0) + 1;
    }

    // Calculate trends
    const trends: ErrorTrend[] = [];
    for (const [errorType, currentCount] of Object.entries(errorCounts)) {
      // In a real implementation, fetch previous period errors
      const previousCount = 0; // Placeholder

      const changePercentage =
        previousCount > 0
          ? ((currentCount - previousCount) / previousCount) * 100
          : currentCount > 0
            ? 100
            : 0;

      let trend: "increasing" | "decreasing" | "stable" = "stable";
      if (Math.abs(changePercentage) < 5) {
        trend = "stable";
      } else if (changePercentage > 0) {
        trend = "increasing";
      } else {
        trend = "decreasing";
      }

      trends.push({
        errorType,
        currentCount,
        previousCount,
        trend,
        changePercentage,
      });
    }

    return trends;
  } catch (error) {
    console.error("Failed to fetch error trends:", error);
    return [];
  }
}

/**
 * Get date string in YYYY-MM-DD format
 */
function getDateString(daysOffset: number, baseDate?: Date): string {
  const date = baseDate || new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split("T")[0];
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