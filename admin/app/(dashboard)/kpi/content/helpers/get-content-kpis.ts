import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { queryModontySearch, type SearchRow } from "@modonty/shared/lib/google/query-modonty-search";

export interface GoogleTotals {
  impressions: number;
  clicks: number;
  /** Clicks ÷ impressions, as a percentage. */
  ctr: number;
  /** Impressions-weighted average position — Google's own way of averaging it. */
  position: number | null;
}

/** One country's slice of the window's Google numbers (`code` = Search Console's alpha-3). */
export interface CountryShare {
  code: string;
  impressions: number;
  clicks: number;
}

export interface ClientKpi {
  id: string;
  name: string;
  current: GoogleTotals;
  previous: GoogleTotals;
  articlesPublished: number;
  /** Published articles that showed in Google at least once in the window. */
  articlesSeen: number;
  /** Where most of this client's impressions came from. */
  topCountry: CountryShare | null;
}

export interface WriterKpi {
  /** null = clients with no writer assigned. */
  id: string | null;
  name: string;
  image: string | null;
  current: GoogleTotals;
  previous: GoogleTotals;
  articlesPublished: number;
  articlesSeen: number;
  topArticle: { title: string; clientName: string; path: string; impressions: number; clicks: number } | null;
  /** Countries by impressions, largest first (top 5, the rest folded into «other»). */
  countries: CountryShare[];
  clients: ClientKpi[];
}

export interface ContentKpis {
  writers: WriterKpi[];
  /** prevStart/prevEnd are null for «All time» — there is no earlier window to compare with. */
  range: { start: string; end: string; prevStart: string | null; prevEnd: string | null };
}

/** `days = 0` means «All time»: Search Console keeps 16 months, so that is where time starts. */
export const ALL_TIME = 0;

const day = (d: Date) => d.toISOString().slice(0, 10);

function totals(rows: { impressions: number; clicks: number; position: number }[]): GoogleTotals {
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const weighted = rows.reduce((s, r) => s + r.position * r.impressions, 0);
  return { impressions, clicks, ctr: impressions ? (clicks / impressions) * 100 : 0, position: impressions ? weighted / impressions : null };
}

const pathOf = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

/**
 * Content KPIs — each writer judged by Google alone (Khalid, 30 Sep 2026: «اهم حاجه عندي جوجل…
 * طارق ماسك عملاء حتلاقي عنده الظهور والنقرات»).
 *
 * A writer owns a client through `Client.editorId`; the client's modonty pages (partner page and
 * its published articles) carry his Search Console numbers. One property holds every client, so
 * two page-level queries (this window and the one before it) cover the whole team. Same property,
 * same `final` data and same page matching as the client's own console dashboard — a writer's
 * total is exactly the sum of what his clients see there.
 */
export const getContentKpis = unstable_cache(
  async (days: number): Promise<ContentKpis> => {
    const end = new Date();
    const start = new Date(end);
    if (days === ALL_TIME) start.setMonth(end.getMonth() - 16);
    else start.setDate(end.getDate() - days);
    const prevEnd = new Date(start);
    prevEnd.setDate(start.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevEnd.getDate() - days);
    const compare = days !== ALL_TIME;

    const [editors, clients, articles, current, previous, byCountry] = await Promise.all([
      db.staff.findMany({ where: { role: "EDITOR", isActive: { not: false } }, select: { id: true, name: true, image: true } }),
      db.client.findMany({ select: { id: true, name: true, slug: true, editor: { select: { id: true, name: true, image: true } } } }),
      db.article.findMany({ where: { status: "PUBLISHED" }, select: { clientId: true, slug: true, title: true } }),
      queryModontySearch({ startDate: day(start), endDate: day(end), dimensions: ["page"] }),
      compare ? queryModontySearch({ startDate: day(prevStart), endDate: day(prevEnd), dimensions: ["page"] }) : Promise.resolve([] as SearchRow[]),
      // Where the impressions came from (Khalid, 30 Sep 2026: «الامبريشن هذا حاصل من فين»).
      queryModontySearch({ startDate: day(start), endDate: day(end), dimensions: ["page", "country"] }),
    ]);

    // Google reports Arabic paths percent-encoded — match on the encoded form.
    const clientByPath = new Map(clients.map((c) => [`/clients/${encodeURIComponent(c.slug)}`, c.id]));
    const articleByPath = new Map(articles.map((a) => [`/articles/${encodeURIComponent(a.slug)}`, a]));
    const ownerOf = (url: string): { clientId: string; article?: (typeof articles)[number]; path: string } | null => {
      const p = pathOf(url);
      const article = articleByPath.get(p);
      if (article) return { clientId: article.clientId, article, path: p };
      const base = p.split("/").slice(0, 3).join("/"); // /clients/<slug>[/sub-page]
      const clientId = clientByPath.get(base);
      return clientId ? { clientId, path: p } : null;
    };

    const group = (rows: SearchRow[]) => {
      const byClient = new Map<string, SearchRow[]>();
      for (const r of rows) {
        const o = ownerOf(r.keys[0]);
        if (!o) continue;
        byClient.set(o.clientId, [...(byClient.get(o.clientId) ?? []), r]);
      }
      return byClient;
    };
    const curByClient = group(current);
    const countryByClient = new Map<string, Map<string, CountryShare>>();
    for (const r of byCountry) {
      const o = ownerOf(r.keys[0]);
      if (!o) continue;
      const m = countryByClient.get(o.clientId) ?? new Map<string, CountryShare>();
      const c = m.get(r.keys[1]) ?? { code: r.keys[1], impressions: 0, clicks: 0 };
      c.impressions += r.impressions;
      c.clicks += r.clicks;
      m.set(r.keys[1], c);
      countryByClient.set(o.clientId, m);
    }
    const byImpressions = (a: CountryShare, b: CountryShare) => b.impressions - a.impressions || b.clicks - a.clicks;
    const prevByClient = group(previous);

    const publishedByClient = new Map<string, number>();
    for (const a of articles) publishedByClient.set(a.clientId, (publishedByClient.get(a.clientId) ?? 0) + 1);

    const clientKpis = new Map<string, ClientKpi>();
    for (const c of clients) {
      const rows = curByClient.get(c.id) ?? [];
      clientKpis.set(c.id, {
        id: c.id,
        name: c.name.trim(),
        current: totals(rows),
        previous: totals(prevByClient.get(c.id) ?? []),
        articlesPublished: publishedByClient.get(c.id) ?? 0,
        // Distinct paths: Google can list one article under more than one URL form (www / not,
        // a query string), which counted 60 «seen» out of 57 published before this.
        topCountry: [...(countryByClient.get(c.id)?.values() ?? [])].sort(byImpressions)[0] ?? null,
        articlesSeen: new Set(rows.filter((r) => r.impressions > 0).map((r) => pathOf(r.keys[0])).filter((p) => articleByPath.has(p))).size,
      });
    }

    // Every active EDITOR gets a card (zero clients shows as zero), plus anyone else a client
    // still names as its writer, plus one «Unassigned» card for clients with nobody.
    const writerInfo = new Map<string | null, { name: string; image: string | null }>();
    for (const e of editors) writerInfo.set(e.id, { name: e.name ?? "—", image: e.image });
    for (const c of clients) if (c.editor && !writerInfo.has(c.editor.id)) writerInfo.set(c.editor.id, { name: c.editor.name ?? "—", image: c.editor.image });
    if (clients.some((c) => !c.editor)) writerInfo.set(null, { name: "Unassigned", image: null });

    const writers: WriterKpi[] = [...writerInfo].map(([id, info]) => {
      const mine = clients.filter((c) => (c.editor?.id ?? null) === id);
      const ids = new Set(mine.map((c) => c.id));
      const curRows = mine.flatMap((c) => curByClient.get(c.id) ?? []);
      const prevRows = mine.flatMap((c) => prevByClient.get(c.id) ?? []);
      // Summed per article path, for the same reason as articlesSeen: one article, several URL forms.
      const perArticle = new Map<string, { impressions: number; clicks: number }>();
      for (const r of curRows) {
        const p = pathOf(r.keys[0]);
        if (!articleByPath.has(p)) continue;
        const acc = perArticle.get(p) ?? { impressions: 0, clicks: 0 };
        acc.impressions += r.impressions;
        acc.clicks += r.clicks;
        perArticle.set(p, acc);
      }
      const topEntry = [...perArticle].sort(([, a], [, b]) => b.clicks - a.clicks || b.impressions - a.impressions)[0];
      const top = topEntry ? { path: topEntry[0], ...topEntry[1] } : null;
      const topArticle = top ? articleByPath.get(top.path)! : null;
      const merged = new Map<string, CountryShare>();
      for (const cid of ids) {
        for (const c of countryByClient.get(cid)?.values() ?? []) {
          const acc = merged.get(c.code) ?? { code: c.code, impressions: 0, clicks: 0 };
          acc.impressions += c.impressions;
          acc.clicks += c.clicks;
          merged.set(c.code, acc);
        }
      }
      const ranked = [...merged.values()].sort(byImpressions);
      const rest = ranked.slice(5);
      const countries = rest.length
        ? [...ranked.slice(0, 5), { code: "other", impressions: rest.reduce((s, c) => s + c.impressions, 0), clicks: rest.reduce((s, c) => s + c.clicks, 0) }]
        : ranked;
      const kpis = [...ids].map((cid) => clientKpis.get(cid)!).sort((a, b) => b.current.clicks - a.current.clicks || b.current.impressions - a.current.impressions);
      return {
        id,
        name: info.name,
        image: info.image,
        current: totals(curRows),
        previous: totals(prevRows),
        articlesPublished: kpis.reduce((s, k) => s + k.articlesPublished, 0),
        articlesSeen: kpis.reduce((s, k) => s + k.articlesSeen, 0),
        topArticle:
          top && topArticle
            ? { title: topArticle.title, clientName: clientKpis.get(topArticle.clientId)?.name ?? "", path: top.path, impressions: top.impressions, clicks: top.clicks }
            : null,
        countries,
        clients: kpis,
      };
    });

    // Ranked by what reached the client — clicks first, impressions to break ties; «Unassigned» last.
    writers.sort((a, b) => (a.id === null ? 1 : b.id === null ? -1 : b.current.clicks - a.current.clicks || b.current.impressions - a.current.impressions));

    return {
      writers,
      range: { start: day(start), end: day(end), prevStart: compare ? day(prevStart) : null, prevEnd: compare ? day(prevEnd) : null },
    };
  },
  // unstable_cache folds `days` into the key — one entry per period. Search Console moves daily.
  ["kpi-content-v4"],
  { revalidate: 6 * 60 * 60, tags: ["gsc-kpi"] },
);
