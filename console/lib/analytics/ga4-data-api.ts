/**
 * GA4 Data API — server-side report fetching.
 *
 * Auth: service account JWT (GA4_PRIVATE_KEY_BASE64 or fallback to GA4_PRIVATE_KEY).
 * Endpoints: runReport, runRealtimeReport.
 *
 * Docs verified via Context7:
 * - https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport
 * - https://developers.google.com/analytics/devguides/reporting/data/v1/realtime-basics
 */

import { createSign } from "node:crypto";
import { unstable_cache } from "next/cache";

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const CLIENT_EMAIL = process.env.GA4_CLIENT_EMAIL;
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

function getPrivateKey(): string | null {
  const b64 = process.env.GA4_PRIVATE_KEY_BASE64;
  if (b64) return Buffer.from(b64, "base64").toString("utf8");
  const raw = process.env.GA4_PRIVATE_KEY;
  if (raw) return raw.replace(/\\n/g, "\n").replace(/\\r/g, "").trim();
  return null;
}

function base64url(data: string | Buffer): string {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const privateKey = getPrivateKey();
  if (!privateKey || !CLIENT_EMAIL) {
    throw new Error("GA4 Data API: missing GA4_PRIVATE_KEY[_BASE64] or GA4_CLIENT_EMAIL");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: CLIENT_EMAIL,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const toSign = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(toSign);
  const jwt = `${toSign}.${base64url(signer.sign(privateKey))}`;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = (await resp.json()) as { access_token?: string; expires_in?: number };
  if (!resp.ok || !data.access_token) {
    throw new Error(`GA4 token error: HTTP ${resp.status}`);
  }
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

// ─── Report types ────────────────────────────────────────────────────────────

interface DimensionFilter {
  filter?: { fieldName: string; stringFilter?: { matchType: "EXACT" | "BEGINS_WITH" | "CONTAINS"; value: string } };
  andGroup?: { expressions: DimensionFilter[] };
  orGroup?: { expressions: DimensionFilter[] };
}

interface RunReportRequest {
  dimensions?: Array<{ name: string }>;
  metrics: Array<{ name: string }>;
  dateRanges: Array<{ startDate: string; endDate: string; name?: string }>;
  dimensionFilter?: DimensionFilter;
  orderBys?: Array<{ metric?: { metricName: string }; dimension?: { dimensionName: string }; desc?: boolean }>;
  limit?: number;
}

interface RunReportResponse {
  dimensionHeaders?: Array<{ name: string }>;
  metricHeaders?: Array<{ name: string; type: string }>;
  rows?: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }>;
  rowCount?: number;
}

interface RunRealtimeReportRequest {
  dimensions?: Array<{ name: string }>;
  metrics: Array<{ name: string }>;
  dimensionFilter?: DimensionFilter;
  orderBys?: Array<{ metric?: { metricName: string }; desc?: boolean }>;
  limit?: number;
  minuteRanges?: Array<{ startMinutesAgo: number; endMinutesAgo?: number; name?: string }>;
}

// ─── Core API call ───────────────────────────────────────────────────────────

async function callAnalyticsAPI<TReq, TResp>(method: "runReport" | "runRealtimeReport", body: TReq): Promise<TResp> {
  if (!PROPERTY_ID) throw new Error("GA4_PROPERTY_ID not set");
  const token = await getAccessToken();
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:${method}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`GA4 ${method} HTTP ${resp.status}: ${errText.slice(0, 200)}`);
  }
  return (await resp.json()) as TResp;
}

export async function runReport(body: RunReportRequest): Promise<RunReportResponse> {
  return callAnalyticsAPI<RunReportRequest, RunReportResponse>("runReport", body);
}

export async function runRealtimeReport(body: RunRealtimeReportRequest): Promise<RunReportResponse> {
  return callAnalyticsAPI<RunRealtimeReportRequest, RunReportResponse>("runRealtimeReport", body);
}

// ─── Helpers — typed query builders ──────────────────────────────────────────

const OUR_EVENTS = [
  "article_view", "article_like", "article_dislike", "article_favorite", "article_share",
  "comment_submit", "comment_reply", "comment_like", "comment_dislike",
  "client_view", "client_share", "client_favorite", "client_comment_submit",
  "newsletter_subscribe", "follow_client", "outbound_click",
  "contact_submit", "ask_client_submit", "campaign_interest", "conversion_complete",
];

export interface ClientOverview {
  activeUsers30Min: number;
  totalEvents7d: number;
  totalEvents28d: number;
  uniqueUsers7d: number;
  uniqueUsers28d: number;
  topEvents: Array<{ name: string; count: number }>;
}

/**
 * Get overview KPIs for a specific client (filtered by client_id).
 * Cached for 60s to reduce API quota usage.
 */
export const getClientOverview = unstable_cache(
  async (clientId: string): Promise<ClientOverview> => {
    const clientFilter: DimensionFilter = {
      filter: { fieldName: "customEvent:client_id", stringFilter: { matchType: "EXACT", value: clientId } },
    };
    const ourEventsFilter: DimensionFilter = {
      filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "" } },
    };

    // 4 queries in parallel
    const [realtime, last7d, last28d, topEvents] = await Promise.all([
      runRealtimeReport({
        metrics: [{ name: "activeUsers" }],
        dimensionFilter: clientFilter,
      }),
      runReport({
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
        dimensionFilter: clientFilter,
      }),
      runReport({
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
        dimensionFilter: clientFilter,
      }),
      runReport({
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: clientFilter,
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 10,
      }),
    ]);

    return {
      activeUsers30Min: Number(realtime.rows?.[0]?.metricValues?.[0]?.value ?? 0),
      totalEvents7d: Number(last7d.rows?.[0]?.metricValues?.[0]?.value ?? 0),
      uniqueUsers7d: Number(last7d.rows?.[0]?.metricValues?.[1]?.value ?? 0),
      totalEvents28d: Number(last28d.rows?.[0]?.metricValues?.[0]?.value ?? 0),
      uniqueUsers28d: Number(last28d.rows?.[0]?.metricValues?.[1]?.value ?? 0),
      topEvents: (topEvents.rows ?? []).map((r) => ({
        name: r.dimensionValues[0].value,
        count: Number(r.metricValues[0].value),
      })),
    };
  },
  ["ga4-client-overview"],
  { revalidate: 60, tags: ["ga4-overview"] },
);

// ─── Phase 5 Wave 2 — 4 deep-dive helpers ────────────────────────────────────

export interface TopArticle {
  slug: string;
  title: string | null;
  views: number;
}

export const getTopArticles = unstable_cache(
  async (clientId: string, limit = 10): Promise<TopArticle[]> => {
    const resp = await runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [
        { name: "customEvent:article_slug" },
        { name: "customEvent:article_title" },
      ],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            { filter: { fieldName: "customEvent:client_id", stringFilter: { matchType: "EXACT", value: clientId } } },
            { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "article_view" } } },
          ],
        },
      },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit,
    });
    return (resp.rows ?? [])
      .map((r) => ({
        slug: r.dimensionValues[0]?.value ?? "",
        title: r.dimensionValues[1]?.value || null,
        views: Number(r.metricValues[0]?.value ?? 0),
      }))
      .filter((a) => a.slug);
  },
  ["ga4-top-articles"],
  { revalidate: 300, tags: ["ga4-overview"] },
);

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

export const getTrafficSources = unstable_cache(
  async (clientId: string, limit = 10): Promise<TrafficSource[]> => {
    const resp = await runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [
        { name: "sessionSource" },
        { name: "sessionMedium" },
      ],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      dimensionFilter: {
        filter: { fieldName: "customEvent:client_id", stringFilter: { matchType: "EXACT", value: clientId } },
      },
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit,
    });
    return (resp.rows ?? []).map((r) => ({
      source: r.dimensionValues[0]?.value ?? "(direct)",
      medium: r.dimensionValues[1]?.value ?? "(none)",
      sessions: Number(r.metricValues[0]?.value ?? 0),
      users: Number(r.metricValues[1]?.value ?? 0),
    }));
  },
  ["ga4-traffic-sources"],
  { revalidate: 300, tags: ["ga4-overview"] },
);

export interface DayHourCell {
  dayOfWeek: number; // 0=Sunday ... 6=Saturday
  hour: number; // 0..23
  events: number;
}

export const getDayPattern = unstable_cache(
  async (clientId: string): Promise<DayHourCell[]> => {
    const resp = await runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [
        { name: "dayOfWeek" },
        { name: "hour" },
      ],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: { fieldName: "customEvent:client_id", stringFilter: { matchType: "EXACT", value: clientId } },
      },
      limit: 200,
    });
    return (resp.rows ?? []).map((r) => ({
      dayOfWeek: Number(r.dimensionValues[0]?.value ?? 0),
      hour: Number(r.dimensionValues[1]?.value ?? 0),
      events: Number(r.metricValues[0]?.value ?? 0),
    }));
  },
  ["ga4-day-pattern"],
  { revalidate: 600, tags: ["ga4-overview"] },
);

export interface ConversionFunnel {
  views: number;
  engagements: number; // like + favorite + comment + share
  intents: number; // ask_client + contact + newsletter + follow
  conversions: number; // conversion_complete
}

export const getConversionFunnel = unstable_cache(
  async (clientId: string): Promise<ConversionFunnel> => {
    const clientFilter: DimensionFilter = {
      filter: { fieldName: "customEvent:client_id", stringFilter: { matchType: "EXACT", value: clientId } },
    };
    const resp = await runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: clientFilter,
      limit: 50,
    });
    const counts: Record<string, number> = {};
    for (const row of resp.rows ?? []) {
      const name = row.dimensionValues[0]?.value ?? "";
      counts[name] = (counts[name] ?? 0) + Number(row.metricValues[0]?.value ?? 0);
    }
    const sum = (...keys: string[]) => keys.reduce((acc, k) => acc + (counts[k] ?? 0), 0);
    return {
      views: sum("article_view", "client_view"),
      engagements: sum(
        "article_like", "article_favorite", "article_share",
        "comment_submit", "comment_reply",
        "client_favorite", "client_share", "client_comment_submit",
      ),
      intents: sum("ask_client_submit", "contact_submit", "newsletter_subscribe", "follow_client"),
      conversions: sum("conversion_complete"),
    };
  },
  ["ga4-conversion-funnel"],
  { revalidate: 300, tags: ["ga4-overview"] },
);

export { OUR_EVENTS };
