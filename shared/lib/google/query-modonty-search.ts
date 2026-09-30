import { getGoogleServiceToken } from "./get-google-service-token";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const PROPERTY = process.env.GSC_MODONTY_PROPERTY ?? "sc-domain:modonty.com";
/** Google's own ceiling per request (developers.google.com · searchanalytics.query: «1–25,000»). */
const PAGE_SIZE = 25_000;

export interface SearchRow {
  keys: string[];
  clicks: number;
  impressions: number;
  position: number;
}

/**
 * One Search Analytics query over all of modonty.com, every page of results. Shared by the console
 * (client dashboard + Looker connector endpoint) and the admin (KPI pages).
 *
 * Every partner's page and article lives on modonty.com, so the one property holds all clients;
 * callers keep only a client's own URLs. `final` (Google's default dataState): finalized numbers,
 * so a figure never shrinks the next day. Throws on a missing key or an HTTP error.
 */
export async function queryModontySearch(body: { startDate: string; endDate: string; dimensions: string[] }): Promise<SearchRow[]> {
  const b64 = process.env.GSC_MODONTY_KEY_BASE64;
  if (!b64) throw new Error("GSC_MODONTY_KEY_BASE64 is not set");
  const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as { client_email: string; private_key: string };
  const token = await getGoogleServiceToken(creds.client_email, creds.private_key, SCOPE);

  const rows: SearchRow[] = [];
  for (let startRow = 0; ; startRow += PAGE_SIZE) {
    const resp = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, rowLimit: PAGE_SIZE, startRow, dataState: "final" }),
        cache: "no-store",
      },
    );
    if (!resp.ok) throw new Error(`Search Console HTTP ${resp.status}`);
    const data = (await resp.json()) as { rows?: SearchRow[] };
    const page = (data.rows ?? []).map((r) => ({ keys: r.keys, clicks: r.clicks, impressions: r.impressions, position: r.position }));
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}
