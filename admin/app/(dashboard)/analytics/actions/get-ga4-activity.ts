"use server";

import { format } from "date-fns";

import { runReport, type DimensionFilter, type RunReportResponse } from "@/lib/analytics/ga4-data-api";

/**
 * GA4-backed full activity — «Google always the SOT» (Khalid, 2026-07-07).
 * Event names verified from modonty/lib/analytics/events-registry.ts.
 */

export interface FullActivity {
  overview: {
    totalEvents: number;
    articleViews: number;
    clientViews: number;
    ctaClicks: number;
    engagement: number;
    leads: number;
  };
  timeline: Array<{ date: string; articleViews: number; clientViews: number; ctaClicks: number }>;
  sources: {
    mix: Record<string, number>;
    topDomains: Array<{ domain: string; count: number }>;
    cleanSince: string;
  };
  geo: {
    countries: Array<{ country: string; count: number; cities: Array<{ city: string; count: number }> }>;
    unknown: number;
  };
  articlesTable: Array<{
    articleId: string;
    title: string;
    client: string;
    views: number;
    mix: Record<string, number>;
    topCountry: string | null;
    ctaClicks: number;
  }>;
  clientsTable: Array<{
    clientId: string;
    name: string;
    visits: number;
    ctaClicks: number;
    bookings: number;
    topSource: string | null;
    topCity: string | null;
  }>;
}

const EV_ARTICLE_VIEW = "article_view";
const EV_CLIENT_VIEW = "client_view";
const EV_CTA = "outbound_click";
const EV_ENGAGEMENT = [
  "article_like",
  "article_dislike",
  "article_favorite",
  "article_share",
  "comment_submit",
  "comment_reply",
  "comment_like",
  "comment_dislike",
  "client_share",
  "client_favorite",
  "client_comment_submit",
  "follow_client",
];
const EV_LEADS = ["booking_submit", "contact_submit", "ask_client_submit", "campaign_interest", "lead_qualified", "newsletter_subscribe"];
// NOTE: conversion_complete deliberately excluded — bookings emit BOTH booking_submit
// and conversion_complete; counting both would double-count the same lead.

// GA4 default channel groups → our palette keys (unknowns pass through as-is).
const CHANNEL_MAP: Record<string, string> = {
  "Organic Search": "ORGANIC",
  Direct: "DIRECT",
  "Organic Social": "SOCIAL",
  "Paid Social": "SOCIAL",
  Referral: "REFERRAL",
  Email: "EMAIL",
  "Paid Search": "PAID",
  Display: "PAID",
  "Paid Other": "PAID",
  "Cross-network": "PAID",
};

export interface GA4ActivityFilters {
  clientSlug?: string;
  articleSlug?: string;
  startDate?: Date;
  endDate?: Date;
}

function ga4Date(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function rows(r: RunReportResponse) {
  return r.rows ?? [];
}

function decodedPath(p: string): string {
  try {
    return decodeURIComponent(p);
  } catch {
    return p;
  }
}

function pathFilter(prefix: string): DimensionFilter {
  return { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: prefix } } };
}

function eventInList(events: string[]): DimensionFilter {
  return { filter: { fieldName: "eventName", inListFilter: { values: events } } };
}

export async function getGA4Activity(filters?: GA4ActivityFilters): Promise<FullActivity> {
  const start = ga4Date(filters?.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const end = ga4Date(filters?.endDate ?? new Date());
  const dateRanges = [{ startDate: start, endDate: end }];

  const wantArticle = filters?.articleSlug ? decodedPath(`/articles/${filters.articleSlug}`) : null;
  const wantClient = filters?.clientSlug ? decodedPath(`/clients/${filters.clientSlug}`) : null;

  // Two batches to stay under GA4's concurrent-request quota.
  const [eventBreakdown, timelineRep, channelRep, domainsRep, geoRep, artViews] = await Promise.all([
    runReport({ dateRanges, dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], limit: 100 }),
    runReport({
      dateRanges,
      dimensions: [{ name: "date" }, { name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventInList([EV_ARTICLE_VIEW, EV_CLIENT_VIEW, EV_CTA]),
      limit: 1000,
    }),
    // Sources & geo scoped to real browser page_view events — our server-side
    // Measurement Protocol events carry no session/geo context and would flood
    // the report with "Unassigned"/(not set) noise.
    runReport({
      dateRanges,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "page_view" } } },
      limit: 20,
    }),
    runReport({
      dateRanges,
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "page_view" } } },
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 12,
    }),
    runReport({
      dateRanges,
      dimensions: [{ name: "countryId" }, { name: "country" }, { name: "city" }],
      metrics: [{ name: "totalUsers" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "page_view" } } },
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 250,
    }),
    runReport({
      dateRanges,
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: pathFilter("/articles/"),
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 300,
    }),
  ]);

  const [geoCountryRep, artChannels, artCountries, artCta, clientViewsRep, clientChannels, clientCities] = await Promise.all([
    // Country totals from a country-only query — summing the city-level rows
    // inflates totalUsers (one user can appear in several cities).
    runReport({
      dateRanges,
      dimensions: [{ name: "countryId" }, { name: "country" }],
      metrics: [{ name: "totalUsers" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "page_view" } } },
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 250,
    }),
    runReport({
      dateRanges,
      dimensions: [{ name: "pagePath" }, { name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: pathFilter("/articles/"),
      limit: 2000,
    }),
    runReport({
      dateRanges,
      dimensions: [{ name: "pagePath" }, { name: "countryId" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: pathFilter("/articles/"),
      limit: 2000,
    }),
    runReport({
      dateRanges,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: EV_CTA } } },
            pathFilter("/articles/"),
          ],
        },
      },
      limit: 500,
    }),
    runReport({
      dateRanges,
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: pathFilter("/clients/"),
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 300,
    }),
    runReport({
      dateRanges,
      dimensions: [{ name: "pagePath" }, { name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: pathFilter("/clients/"),
      limit: 2000,
    }),
    runReport({
      dateRanges,
      dimensions: [{ name: "pagePath" }, { name: "city" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: pathFilter("/clients/"),
      limit: 2000,
    }),
  ]);

  // ── Overview from event breakdown
  const eventCounts: Record<string, number> = {};
  for (const r of rows(eventBreakdown)) {
    eventCounts[r.dimensionValues[0].value] = Number(r.metricValues[0].value) || 0;
  }
  const engagement = EV_ENGAGEMENT.reduce((s, e) => s + (eventCounts[e] || 0), 0);
  const leads = EV_LEADS.reduce((s, e) => s + (eventCounts[e] || 0), 0);
  const overview = {
    articleViews: eventCounts[EV_ARTICLE_VIEW] || 0,
    clientViews: eventCounts[EV_CLIENT_VIEW] || 0,
    ctaClicks: eventCounts[EV_CTA] || 0,
    engagement,
    leads,
    totalEvents: (eventCounts[EV_ARTICLE_VIEW] || 0) + (eventCounts[EV_CLIENT_VIEW] || 0) + (eventCounts[EV_CTA] || 0) + engagement + leads,
  };

  // ── Timeline (GA4 date = YYYYMMDD)
  const days = new Map<string, { articleViews: number; clientViews: number; ctaClicks: number }>();
  for (const r of rows(timelineRep)) {
    const raw = r.dimensionValues[0].value;
    const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    const ev = r.dimensionValues[1].value;
    const n = Number(r.metricValues[0].value) || 0;
    if (!days.has(date)) days.set(date, { articleViews: 0, clientViews: 0, ctaClicks: 0 });
    const d = days.get(date)!;
    if (ev === EV_ARTICLE_VIEW) d.articleViews += n;
    else if (ev === EV_CLIENT_VIEW) d.clientViews += n;
    else if (ev === EV_CTA) d.ctaClicks += n;
  }
  const timeline = [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, ...v }));

  // ── Sources
  const mix: Record<string, number> = {};
  for (const r of rows(channelRep)) {
    const key = CHANNEL_MAP[r.dimensionValues[0].value] ?? r.dimensionValues[0].value;
    mix[key] = (mix[key] || 0) + (Number(r.metricValues[0].value) || 0);
  }
  const topDomains = rows(domainsRep)
    .map((r) => ({ domain: r.dimensionValues[0].value, count: Number(r.metricValues[0].value) || 0 }))
    .filter((d) => d.domain && d.domain !== "(direct)" && d.domain !== "(not set)")
    .slice(0, 8);

  // ── Geo (country key = "CC — Name" so the UI shows a readable name even where
  // Windows renders flag emojis as letters). Counts come from the country-only
  // report; the city-level report only feeds the per-country city breakdown.
  const geoMap = new Map<string, { count: number; cities: Record<string, number> }>();
  const geoByCc = new Map<string, { count: number; cities: Record<string, number> }>();
  let unknown = 0;
  for (const r of rows(geoCountryRep)) {
    const cc = r.dimensionValues[0].value;
    const countryName = r.dimensionValues[1].value;
    const n = Number(r.metricValues[0].value) || 0;
    if (!cc || cc === "(not set)") {
      unknown += n;
      continue;
    }
    const entry = { count: n, cities: {} };
    geoMap.set(`${cc}|${countryName || cc}`, entry);
    geoByCc.set(cc, entry);
  }
  for (const r of rows(geoRep)) {
    const g = geoByCc.get(r.dimensionValues[0].value);
    const city = r.dimensionValues[2].value;
    if (!g || !city || city === "(not set)") continue;
    g.cities[city] = (g.cities[city] || 0) + (Number(r.metricValues[0].value) || 0);
  }
  const countries = [...geoMap.entries()]
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([key, g]) => ({
      country: key, // "CC|Name" — UI splits for flag + label
      count: g.count,
      cities: Object.entries(g.cities)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([city, count]) => ({ city, count })),
    }));

  // ── Articles table (aggregate by decoded path; optional slug drill-down)
  const keepArticle = (path: string) => !wantArticle || decodedPath(path) === wantArticle;
  const artAgg = new Map<string, { title: string; views: number; mix: Record<string, number>; countries: Record<string, number>; cta: number }>();
  for (const r of rows(artViews)) {
    const path = decodedPath(r.dimensionValues[0].value);
    if (!keepArticle(path)) continue;
    const title = (r.dimensionValues[1].value || path).split("|")[0].trim();
    if (!artAgg.has(path)) artAgg.set(path, { title, views: 0, mix: {}, countries: {}, cta: 0 });
    artAgg.get(path)!.views += Number(r.metricValues[0].value) || 0;
  }
  for (const r of rows(artChannels)) {
    const path = decodedPath(r.dimensionValues[0].value);
    const a = artAgg.get(path);
    if (!a) continue;
    const key = CHANNEL_MAP[r.dimensionValues[1].value] ?? r.dimensionValues[1].value;
    a.mix[key] = (a.mix[key] || 0) + (Number(r.metricValues[0].value) || 0);
  }
  for (const r of rows(artCountries)) {
    const path = decodedPath(r.dimensionValues[0].value);
    const a = artAgg.get(path);
    if (!a) continue;
    const cc = r.dimensionValues[1].value;
    if (cc && cc !== "(not set)") a.countries[cc] = (a.countries[cc] || 0) + (Number(r.metricValues[0].value) || 0);
  }
  for (const r of rows(artCta)) {
    const path = decodedPath(r.dimensionValues[0].value);
    const a = artAgg.get(path);
    if (a) a.cta += Number(r.metricValues[0].value) || 0;
  }
  const topKey = (counts: Record<string, number>) => {
    let best: string | null = null;
    let n = 0;
    for (const [k, v] of Object.entries(counts)) if (v > n) { best = k; n = v; }
    return best;
  };
  const articlesTable = [...artAgg.entries()]
    .sort(([, a], [, b]) => b.views - a.views)
    .slice(0, 20)
    .map(([path, a]) => ({
      articleId: path,
      title: a.title,
      client: "—", // GA4 pagePath has no client dimension; per-client via the client filter
      views: a.views,
      mix: a.mix,
      topCountry: topKey(a.countries),
      ctaClicks: a.cta,
    }));

  // ── Client pages table
  // exact root or sub-page — plain startsWith would also match "/clients/foo-bar" for slug "foo"
  const keepClient = (path: string) => {
    if (!wantClient) return true;
    const p = decodedPath(path);
    return p === wantClient || p.startsWith(`${wantClient}/`);
  };
  const clAgg = new Map<string, { name: string; visits: number; sources: Record<string, number>; cities: Record<string, number> }>();
  for (const r of rows(clientViewsRep)) {
    const path = decodedPath(r.dimensionValues[0].value);
    if (!keepClient(path)) continue;
    // group sub-pages under the client root: /clients/<slug>
    const root = path.split("/").slice(0, 3).join("/");
    const name = (r.dimensionValues[1].value || root).split("|")[0].trim();
    if (!clAgg.has(root)) clAgg.set(root, { name, visits: 0, sources: {}, cities: {} });
    clAgg.get(root)!.visits += Number(r.metricValues[0].value) || 0;
  }
  const addToClient = (path: string, key: string, n: number, field: "sources" | "cities") => {
    const root = decodedPath(path).split("/").slice(0, 3).join("/");
    const c = clAgg.get(root);
    if (!c) return;
    c[field][key] = (c[field][key] || 0) + n;
  };
  for (const r of rows(clientChannels)) {
    const key = CHANNEL_MAP[r.dimensionValues[1].value] ?? r.dimensionValues[1].value;
    addToClient(r.dimensionValues[0].value, key, Number(r.metricValues[0].value) || 0, "sources");
  }
  for (const r of rows(clientCities)) {
    const city = r.dimensionValues[1].value;
    if (!city || city === "(not set)") continue;
    addToClient(r.dimensionValues[0].value, city, Number(r.metricValues[0].value) || 0, "cities");
  }
  const clientsTable = [...clAgg.entries()]
    .sort(([, a], [, b]) => b.visits - a.visits)
    .slice(0, 20)
    .map(([root, c]) => ({
      clientId: root,
      name: c.name,
      visits: c.visits,
      ctaClicks: 0, // per-client CTA needs the registered custom dimension — phase 2
      bookings: 0, // bookings live in our DB, not GA4
      topSource: topKey(c.sources),
      topCity: topKey(c.cities),
    }));

  return {
    overview,
    timeline,
    sources: { mix, topDomains, cleanSince: "GA4 — full history" },
    geo: { countries, unknown },
    articlesTable,
    clientsTable,
  };
}
