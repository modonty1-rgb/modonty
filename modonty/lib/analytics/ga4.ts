/**
 * GA4 Data API — site-wide footer stats (read-only).
 *
 * Auth: service account JWT (GA4_PRIVATE_KEY_BASE64 → fallback GA4_PRIVATE_KEY).
 * Env (GA4_PROPERTY_ID / GA4_CLIENT_EMAIL / key) reaches this app via
 * next.config.ts → dotenv loads ../.env.shared. In production the same vars must
 * exist on the modonty Vercel project.
 *
 * Cached ("use cache" + cacheLife "minutes") so the global footer hits the GA4
 * API at most ~once a minute (stale-while-revalidate) — pages stay fast. Any
 * failure (missing env, quota, network) returns null so the footer falls back
 * to live DB record counts and never breaks.
 *
 * Docs: https://developers.google.com/analytics/devguides/reporting/data/v1
 */

import { createSign } from "node:crypto";
import { cacheTag, cacheLife } from "next/cache";

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const CLIENT_EMAIL = process.env.GA4_CLIENT_EMAIL;
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

// Cumulative since launch (property has no data before this) → number only grows.
const SINCE = "2025-01-01";

// Genuine human interactions — excludes auto/technical events (web_vitals, scroll,
// user_engagement, session_start, page_view, first_visit) which would inflate the count.
const ENGAGEMENT_EVENTS = new Set([
  "outbound_click",
  "article_like",
  "article_favorite",
  "article_share",
  "comment_submit",
  "comment_reply",
  "client_favorite",
  "client_share",
  "client_comment_submit",
  "follow_client",
  "ask_client_submit",
  "contact_submit",
  "newsletter_subscribe",
  "conversion_complete",
]);

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
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;
  const privateKey = getPrivateKey();
  if (!privateKey || !CLIENT_EMAIL) throw new Error("GA4: missing credentials");

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ iss: CLIENT_EMAIL, scope: SCOPE, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }),
  );
  const toSign = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(toSign);
  const jwt = `${toSign}.${base64url(signer.sign(privateKey))}`;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const data = (await resp.json()) as { access_token?: string; expires_in?: number };
  if (!resp.ok || !data.access_token) throw new Error(`GA4 token HTTP ${resp.status}`);
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return data.access_token;
}

interface ReportResponse {
  rows?: Array<{ dimensionValues?: Array<{ value: string }>; metricValues?: Array<{ value: string }> }>;
}

async function call(method: "runReport" | "runRealtimeReport", body: unknown): Promise<ReportResponse> {
  if (!PROPERTY_ID) throw new Error("GA4_PROPERTY_ID not set");
  const token = await getAccessToken();
  const resp = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:${method}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`GA4 ${method} HTTP ${resp.status}`);
  return (await resp.json()) as ReportResponse;
}

export interface Ga4FooterStats {
  sessions: number;
  pageViews: number;
  events: number;
  interactions: number;
  avgSessionSeconds: number;
}

export async function getGa4FooterStats(): Promise<Ga4FooterStats | null> {
  "use cache";
  cacheTag("ga4-footer");
  cacheLife("minutes");

  try {
    const [totals, events] = await Promise.all([
      call("runReport", {
        dateRanges: [{ startDate: SINCE, endDate: "today" }],
        metrics: [
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "eventCount" },
          { name: "averageSessionDuration" },
        ],
      }),
      call("runReport", {
        dateRanges: [{ startDate: SINCE, endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        limit: 100,
      }),
    ]);

    const t = totals.rows?.[0]?.metricValues ?? [];
    const sessions = Number(t[0]?.value ?? 0);
    const pageViews = Number(t[1]?.value ?? 0);
    const eventsTotal = Number(t[2]?.value ?? 0);
    const avgSessionSeconds = Math.round(Number(t[3]?.value ?? 0));

    let interactions = 0;
    for (const row of events.rows ?? []) {
      const name = row.dimensionValues?.[0]?.value ?? "";
      if (ENGAGEMENT_EVENTS.has(name)) interactions += Number(row.metricValues?.[0]?.value ?? 0);
    }

    // No usable data → let the footer fall back to DB counts.
    if (!sessions && !pageViews) return null;

    return { sessions, pageViews, events: eventsTotal, interactions, avgSessionSeconds };
  } catch {
    return null;
  }
}

// ─── Full site analytics (for the public /analytics report page) ──────────────

export interface NameVal {
  name: string;
  value: number;
}

export interface SiteAnalytics {
  kpis: {
    sessions: number;
    users: number;
    newUsers: number;
    pageViews: number;
    events: number;
    interactions: number;
    engagedSessions: number;
    avgSessionSeconds: number;
    engagementRate: number; // 0..1
    bounceRate: number; // 0..1
    viewsPerSession: number;
  };
  byDate: Array<{ date: string; sessions: number; pageViews: number }>;
  channels: NameVal[];
  devices: NameVal[];
  os: NameVal[];
  browsers: NameVal[];
  countries: NameVal[];
  cities: NameVal[];
  languages: NameVal[];
  topPages: Array<{ path: string; title: string; views: number }>;
  landingPages: NameVal[];
  byDayOfWeek: NameVal[]; // name = "0".."6"
  byHour: NameVal[]; // name = "0".."23"
  events: NameVal[];
  sources: Array<{ source: string; medium: string; sessions: number }>;
  generatedAt: string;
}

// ─── Per-client GA4 stats (for the /clients directory cards) ──────────────────

export interface ClientGA4Stats {
  pageViews: number;
  sessions: number;
  activeUsers: number;
  events: number;
  /** Sum of all GA4 activity — displayed as "تفاعلات" in client cards. */
  total: number;
}

export async function getClientsGA4Stats(): Promise<Record<string, ClientGA4Stats>> {
  "use cache";
  cacheTag("ga4-clients");
  cacheLife("hours");

  try {
    const report = await call("runReport", {
      dateRanges: [{ startDate: SINCE, endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "eventCount" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: "/clients/" },
        },
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 500,
    });

    const result: Record<string, ClientGA4Stats> = {};
    for (const row of report.rows ?? []) {
      const raw = row.dimensionValues?.[0]?.value ?? "";
      // "/clients/some-slug" or "/clients/some-slug/" → "some-slug"
      const encoded = raw.replace(/^\/clients\//, "").replace(/\/$/, "");
      if (!encoded) continue;
      const pageViews = Number(row.metricValues?.[0]?.value ?? 0);
      const sessions  = Number(row.metricValues?.[1]?.value ?? 0);
      const activeUsers = Number(row.metricValues?.[2]?.value ?? 0);
      const events    = Number(row.metricValues?.[3]?.value ?? 0);
      const stats: ClientGA4Stats = {
        pageViews,
        sessions,
        activeUsers,
        events,
        total: pageViews + sessions + activeUsers + events,
      };
      // Store under both the raw (possibly encoded) and decoded slug to match DB slugs.
      result[encoded] = stats;
      try {
        const decoded = decodeURIComponent(encoded);
        if (decoded !== encoded) result[decoded] = stats;
      } catch {
        // malformed percent-encoding — skip decoded variant
      }
    }
    return result;
  } catch {
    return {};
  }
}

// ─── Full site analytics (for the public /analytics report page) ──────────────

function rowsOf(r: ReportResponse): NonNullable<ReportResponse["rows"]> {
  return r.rows ?? [];
}
function dimVal(row: { dimensionValues?: Array<{ value: string }> }, i = 0): string {
  return row.dimensionValues?.[i]?.value ?? "";
}
function metVal(row: { metricValues?: Array<{ value: string }> }, i = 0): number {
  return Number(row.metricValues?.[i]?.value ?? 0);
}

export async function getSiteAnalytics(): Promise<SiteAnalytics | null> {
  "use cache";
  cacheTag("ga4-site-analytics");
  cacheLife("hours");

  const range = [{ startDate: SINCE, endDate: "today" }];
  const last90 = [{ startDate: "90daysAgo", endDate: "today" }];
  const bySessions = [{ metric: { metricName: "sessions" }, desc: true }];

  try {
    const [
      kpi, byDate, channels, devices, os, browsers, countries, cities,
      languages, topPages, landingPages, dow, hour, eventsR, sources,
    ] = await Promise.all([
      call("runReport", { dateRanges: range, metrics: [
        { name: "sessions" }, { name: "totalUsers" }, { name: "newUsers" }, { name: "screenPageViews" },
        { name: "eventCount" }, { name: "engagedSessions" }, { name: "averageSessionDuration" },
        { name: "engagementRate" }, { name: "bounceRate" }, { name: "screenPageViewsPerSession" },
      ] }),
      call("runReport", { dateRanges: last90, dimensions: [{ name: "date" }], metrics: [{ name: "sessions" }, { name: "screenPageViews" }], orderBys: [{ dimension: { dimensionName: "date" } }], limit: 92 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }, { name: "totalUsers" }], orderBys: bySessions, limit: 10 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "sessions" }], orderBys: bySessions, limit: 5 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "operatingSystem" }], metrics: [{ name: "sessions" }], orderBys: bySessions, limit: 6 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "browser" }], metrics: [{ name: "sessions" }], orderBys: bySessions, limit: 6 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "country" }], metrics: [{ name: "sessions" }], orderBys: bySessions, limit: 10 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "city" }], metrics: [{ name: "sessions" }], orderBys: bySessions, limit: 10 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "language" }], metrics: [{ name: "sessions" }], orderBys: bySessions, limit: 6 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "pagePath" }, { name: "pageTitle" }], metrics: [{ name: "screenPageViews" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 15 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "landingPage" }], metrics: [{ name: "sessions" }], orderBys: bySessions, limit: 10 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "dayOfWeek" }], metrics: [{ name: "sessions" }], limit: 7 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "hour" }], metrics: [{ name: "sessions" }], limit: 24 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 50 }),
      call("runReport", { dateRanges: range, dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }], metrics: [{ name: "sessions" }], orderBys: bySessions, limit: 12 }),
    ]);

    const k = kpi.rows?.[0]?.metricValues ?? [];
    if (!Number(k[0]?.value) && !Number(k[3]?.value)) return null;

    const eventRows = rowsOf(eventsR);
    let interactions = 0;
    for (const row of eventRows) {
      if (ENGAGEMENT_EVENTS.has(dimVal(row))) interactions += metVal(row);
    }

    const nv = (r: ReportResponse): NameVal[] => rowsOf(r).map((row) => ({ name: dimVal(row), value: metVal(row) }));

    return {
      kpis: {
        sessions: Number(k[0]?.value ?? 0),
        users: Number(k[1]?.value ?? 0),
        newUsers: Number(k[2]?.value ?? 0),
        pageViews: Number(k[3]?.value ?? 0),
        events: Number(k[4]?.value ?? 0),
        interactions,
        engagedSessions: Number(k[5]?.value ?? 0),
        avgSessionSeconds: Math.round(Number(k[6]?.value ?? 0)),
        engagementRate: Number(k[7]?.value ?? 0),
        bounceRate: Number(k[8]?.value ?? 0),
        viewsPerSession: Number(k[9]?.value ?? 0),
      },
      byDate: rowsOf(byDate).map((row) => ({ date: dimVal(row), sessions: metVal(row, 0), pageViews: metVal(row, 1) })),
      channels: rowsOf(channels).map((row) => ({ name: dimVal(row), value: metVal(row) })),
      devices: nv(devices),
      os: nv(os),
      browsers: nv(browsers),
      countries: nv(countries),
      cities: nv(cities),
      languages: nv(languages),
      topPages: rowsOf(topPages).map((row) => ({ path: dimVal(row, 0), title: dimVal(row, 1), views: metVal(row) })),
      landingPages: nv(landingPages),
      byDayOfWeek: nv(dow),
      byHour: nv(hour),
      events: nv(eventsR),
      sources: rowsOf(sources).map((row) => ({ source: dimVal(row, 0), medium: dimVal(row, 1), sessions: metVal(row) })),
      generatedAt: range[0].endDate,
    };
  } catch {
    return null;
  }
}
