/**
 * GA4 Data API — server-side report fetching (admin).
 * Base client ported from the proven console implementation
 * (console/lib/analytics/ga4-data-api.ts) — consolidation into dataLayer is
 * tracked in the shared-code audit.
 *
 * Auth: service account JWT (GA4_PRIVATE_KEY_BASE64 or fallback to GA4_PRIVATE_KEY).
 * Docs: developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport
 */

import { createSign } from "node:crypto";

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
  const payload = base64url(
    JSON.stringify({
      iss: CLIENT_EMAIL,
      scope: SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
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

export interface DimensionFilter {
  filter?: {
    fieldName: string;
    stringFilter?: { matchType: "EXACT" | "BEGINS_WITH" | "CONTAINS"; value: string };
    inListFilter?: { values: string[] };
  };
  andGroup?: { expressions: DimensionFilter[] };
  orGroup?: { expressions: DimensionFilter[] };
}

export interface RunReportRequest {
  dimensions?: Array<{ name: string }>;
  metrics: Array<{ name: string }>;
  dateRanges: Array<{ startDate: string; endDate: string; name?: string }>;
  dimensionFilter?: DimensionFilter;
  orderBys?: Array<{ metric?: { metricName: string }; dimension?: { dimensionName: string }; desc?: boolean }>;
  limit?: number;
}

export interface RunReportResponse {
  dimensionHeaders?: Array<{ name: string }>;
  metricHeaders?: Array<{ name: string; type: string }>;
  rows?: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }>;
  rowCount?: number;
}

export async function runReport(body: RunReportRequest): Promise<RunReportResponse> {
  if (!PROPERTY_ID) throw new Error("GA4_PROPERTY_ID not set");
  const token = await getAccessToken();
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`GA4 runReport HTTP ${resp.status}: ${errText.slice(0, 200)}`);
  }
  return (await resp.json()) as RunReportResponse;
}
