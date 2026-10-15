import { db } from "@/lib/db";
import { queryAnalytics } from "@/lib/gsc/analytics";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { buildArticleUrlFromBase } from "@/lib/seo/url-builders";

/**
 * **النتائج** — هل جاءت الفكرة بزيارات؟ (خالد ١٥ أكتوبر ٢٠٢٦: نقيس أثر البنك لا عدد أفكاره.)
 * كل فكرة «كُتبت» مربوطة بمقالها، ورقم المقال في قوقل آخر ٢٨ يوماً من Search Console. الحكم بعد ٣٠
 * يوماً من النشر — قبلها قوقل لم يرتّب المقال بعد، فالصفر «مبكر» لا «فشل».
 */
export type IdeaResult = {
  id: string;
  topic: string;
  fieldName: string | null;
  articleTitle: string;
  articleUrl: string;
  writtenAt: string;
  daysSince: number;
  /** null = Search Console غير متاح. */
  gsc: { impressions: number; clicks: number; position: number } | null;
};

const DAY = 86400_000;
const TTL_MS = 6 * 3600_000;

let pageCache: { at: number; rows: Map<string, { impressions: number; clicks: number; position: number }> } | null = null;

const key = (url: string) => {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname).replace(/\/$/, "");
  } catch {
    return url;
  }
};

async function pageMetrics() {
  if (pageCache && Date.now() - pageCache.at < TTL_MS) return pageCache.rows;
  const end = new Date();
  const start = new Date(end.getTime() - 31 * DAY); // Search Console متأخر ٢–٣ أيام
  const res = await queryAnalytics({
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    dimensions: ["page"],
    rowLimit: 25000,
  });
  const rows = new Map(res.rows.map((r) => [key(r.keys[0] ?? ""), { impressions: r.impressions, clicks: r.clicks, position: r.position }]));
  pageCache = { at: Date.now(), rows };
  return rows;
}

export async function getIdeaResults(): Promise<IdeaResult[]> {
  const items = await db.ideaBankItem.findMany({
    where: { status: "USED", articleId: { not: null } },
    select: { id: true, topic: true, fieldName: true, articleId: true, writtenAt: true },
    orderBy: { writtenAt: "desc" },
    take: 300,
  });
  if (items.length === 0) return [];

  const [articles, base, pages] = await Promise.all([
    db.article.findMany({
      where: { id: { in: items.map((i) => i.articleId!) } },
      select: { id: true, title: true, slug: true },
      take: items.length,
    }),
    loadSiteUrl(),
    pageMetrics().catch((e) => {
      console.error("[idea-bank] Search Console unavailable for results:", e);
      return null;
    }),
  ]);
  const byId = new Map(articles.map((a) => [a.id, a]));

  return items.flatMap((i) => {
    const a = byId.get(i.articleId!);
    if (!a) return []; // مقالٌ حُذف بعد الربط
    const url = buildArticleUrlFromBase(a.slug, base);
    const writtenAt = i.writtenAt ?? new Date();
    return [{
      id: i.id,
      topic: i.topic,
      fieldName: i.fieldName,
      articleTitle: a.title,
      articleUrl: url,
      writtenAt: writtenAt.toISOString(),
      daysSince: Math.max(0, Math.floor((Date.now() - writtenAt.getTime()) / DAY)),
      gsc: pages ? pages.get(key(url)) ?? { impressions: 0, clicks: 0, position: 0 } : null,
    }];
  });
}
