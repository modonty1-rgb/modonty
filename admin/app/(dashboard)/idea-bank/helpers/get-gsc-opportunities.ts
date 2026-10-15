import { db } from "@/lib/db";
import { queryAnalytics } from "@/lib/gsc/analytics";

/**
 * **فرص قوقل** (خالد ١٥ أكتوبر ٢٠٢٦: «سيرش كونسول جدّاً جدّاً مهم») — ميزةٌ لا يملكها كاتبٌ يفتح قوقل:
 * كلماتٌ يرانا فيها قوقل فعلاً، من Search Console مدونتي، آخر ٢٨ يوماً.
 *
 * - **قريبة من الصفحة الأولى:** المركز ٨–٣٠ — مقالٌ أقوى (أو مقالٌ مخصّص إن كانت الصفحة ليست مقالاً)
 *   ينقلها للصفحة الأولى.
 * - **نظهر ولا أحد يضغط:** المركز أعلى من ٨ والنقر أقل من ٢٪ — العنوان والوصف لا يقنعان.
 *
 * تُجمع الكلمات حسب الصفحة التي يعرضها قوقل: عشر صيغ لـ«عبارات اليوم الوطني» على مقالٍ واحد = صفٌّ
 * واحد، يحمل العملين معاً إن احتاجهما (كان الصفّ يتكرّر للصفحة نفسها — «لخبطة»).
 * معلومةٌ لا قرار — لا حالة تُحفظ، والمصدر Search Console نفسه.
 */
export type GscKind = "near" | "click";

export type GscOpportunity = {
  id: string;
  kinds: GscKind[];
  pageUrl: string;
  pageLabel: string;
  isArticle: boolean;
  impressions: number;
  clicks: number;
  position: number;
  queries: { query: string; kind: GscKind; impressions: number; clicks: number; position: number }[];
};

const DAYS = 28;
const NEAR = { minPos: 8, maxPos: 30, minImpr: 30 };
const CLICK = { maxPos: 8, minImpr: 100, maxCtr: 0.02 };
const TTL_MS = 6 * 3600_000; // Search Console متأخر يومين أصلاً — لا معنى لجلبه كل تحميل

type Raw = { query: string; page: string; impressions: number; clicks: number; ctr: number; position: number };
let cache: { at: number; rows: Raw[] } | null = null;

async function rawRows(): Promise<Raw[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - DAYS - 3);
  const res = await queryAnalytics({
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    dimensions: ["query", "page"],
    rowLimit: 25000,
  });
  const rows = res.rows.map((r) => ({
    query: r.keys[0] ?? "",
    page: r.keys[1] ?? "",
    impressions: r.impressions,
    clicks: r.clicks,
    ctr: r.ctr,
    position: r.position,
  }));
  cache = { at: Date.now(), rows };
  return rows;
}

const articleSlug = (url: string) => {
  try {
    const m = decodeURIComponent(new URL(url).pathname).match(/^\/articles\/([^/]+)\/?$/);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
};

const pathLabel = (url: string) => {
  try {
    const p = decodeURIComponent(new URL(url).pathname);
    return p === "/" ? "الصفحة الرئيسية" : p;
  } catch {
    return url;
  }
};

const kindOf = (r: Raw): GscKind | null => {
  if (r.position >= NEAR.minPos && r.position <= NEAR.maxPos && r.impressions >= NEAR.minImpr) return "near";
  if (r.position < CLICK.maxPos && r.impressions >= CLICK.minImpr && r.ctr < CLICK.maxCtr) return "click";
  return null;
};

/** null = Search Console غير متاح (يُعرض كذلك، لا قائمةٌ فارغة توهم أن لا فرص). */
export async function getGscOpportunities(): Promise<GscOpportunity[] | null> {
  let rows: Raw[];
  try {
    rows = await rawRows();
  } catch (e) {
    console.error("[idea-bank] Search Console unavailable:", e);
    return null;
  }

  const groups = new Map<string, { page: string; rows: (Raw & { kind: GscKind })[] }>();
  for (const r of rows) {
    const kind = kindOf(r);
    if (!kind) continue;
    const g = groups.get(r.page) ?? { page: r.page, rows: [] };
    g.rows.push({ ...r, kind });
    groups.set(r.page, g);
  }

  const slugs = [...new Set([...groups.values()].map((g) => articleSlug(g.page)).filter((s): s is string => !!s))];
  const articles = slugs.length
    ? await db.article.findMany({ where: { slug: { in: slugs } }, select: { slug: true, title: true }, take: slugs.length })
    : [];
  const titleOf = new Map(articles.map((a) => [a.slug, a.title]));

  return [...groups.entries()]
    .map(([id, g]) => {
      const impressions = g.rows.reduce((n, r) => n + r.impressions, 0);
      const slug = articleSlug(g.page);
      return {
        id,
        // «قوِّ» قبل «عدّل» — الصفحة الثانية تُكسب ظهوراً جديداً، والعنوان يحسّن ما عندنا
        kinds: (["near", "click"] as const).filter((k) => g.rows.some((r) => r.kind === k)),
        pageUrl: g.page,
        // عنوان المقال من قاعدتنا؛ وإن لم يوجد فيها (مقالٌ على الإنتاج لا على dev) فالرابط مقروءاً
        pageLabel: (slug && titleOf.get(slug)) || (slug ? slug.replace(/-/g, " ") : pathLabel(g.page)),
        isArticle: !!slug,
        impressions,
        clicks: g.rows.reduce((n, r) => n + r.clicks, 0),
        // المركز موزوناً بالظهور — كلمةٌ بعشرة آلاف ظهور أثقل من كلمةٍ بثلاثين
        position: g.rows.reduce((n, r) => n + r.position * r.impressions, 0) / Math.max(1, impressions),
        queries: g.rows
          .sort((a, b) => b.impressions - a.impressions)
          .map(({ query, kind, impressions, clicks, position }) => ({ query, kind, impressions, clicks, position })),
      };
    })
    .sort((a, b) => b.impressions - a.impressions);
}
