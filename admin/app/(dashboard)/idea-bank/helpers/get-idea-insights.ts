import { db } from "@/lib/db";
import { getTopQueries } from "@/lib/gsc/analytics";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { buildArticleUrlFromBase } from "@/lib/seo/url-builders";
import { makeTopicMatcher } from "./make-topic-matcher";

/**
 * معلوماتٌ تُعرض جنب الفكرة — لا قرار (خالد ١٥ أكتوبر ٢٠٢٦: «نبغى نديه المعلومة بس، ما نبغى نجبره»):
 *
 * - **كتبنا عنه قبل:** مقالات مدونتي المنشورة القريبة من الموضوع — فيُحدَّث القديم بدل مقالٍ ينافسه.
 * - **عملاء الصناعة:** لفكرة صناعةٍ، عملاؤنا في تلك الصناعة — فتصير مقالاً لعميل لا لمدونتي وحدها.
 * - **Search Console:** هل يظهر موقعنا في قوقل على عبارات قريبة من الموضوع (آخر ٢٨ يوماً) — رقمٌ
 *   مقيس جنب «القوة» التي هي تقدير Claude.
 *
 * كلّها بثلاثة استعلامات للصفحة كلّها (مقالات · عملاء · Search Console) ثم مطابقة في الذاكرة —
 * لا استعلام لكل صفّ.
 */
export type IdeaInsight = {
  written: { title: string; url: string }[];
  clients: { id: string; name: string }[];
  gsc: { impressions: number; clicks: number; topQuery: string | null } | null;
};

type GscCache = { at: number; rows: { query: string; clicks: number; impressions: number }[] } | null;
let gscCache: GscCache = null;
const GSC_TTL_MS = 6 * 3600_000; // بيانات Search Console متأخرة يومين أصلاً — لا معنى لجلبها كل تحميل

async function gscQueries() {
  if (gscCache && Date.now() - gscCache.at < GSC_TTL_MS) return gscCache.rows;
  try {
    const rows = (await getTopQueries(28, 5000)).map((r) => ({ query: r.keys[0] ?? "", clicks: r.clicks, impressions: r.impressions }));
    gscCache = { at: Date.now(), rows };
    return rows;
  } catch (e) {
    console.error("[idea-bank] Search Console unavailable:", e);
    return null; // غيابه يُعرض «غير متاح» — لا صفرٌ يوهم أن الموضوع بلا ظهور
  }
}

export async function getIdeaInsights(
  items: { id: string; topic: string; fieldType: string | null; fieldKey: string | null }[],
): Promise<Record<string, IdeaInsight>> {
  const industryIds = [...new Set(items.filter((i) => i.fieldType === "industry" && i.fieldKey).map((i) => i.fieldKey!))];
  const [articles, clients, base, queries] = await Promise.all([
    db.article.findMany({ where: { status: "PUBLISHED" }, select: { title: true, slug: true }, take: 2000 }),
    industryIds.length
      ? db.client.findMany({ where: { industryId: { in: industryIds } }, select: { id: true, name: true, industryId: true }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
    loadSiteUrl(),
    gscQueries(),
  ]);

  const out: Record<string, IdeaInsight> = {};
  for (const it of items) {
    const m = makeTopicMatcher(it.topic);
    const written =
      m.needed === 0
        ? []
        : articles
            .map((a) => ({ a, s: m.score(a.title) }))
            .filter((x) => x.s >= m.needed)
            .sort((x, y) => y.s - x.s)
            .slice(0, 3)
            .map(({ a }) => ({ title: a.title, url: buildArticleUrlFromBase(a.slug, base) }));

    let gsc: IdeaInsight["gsc"] = null;
    if (queries && m.needed > 0) {
      const hits = queries.filter((q) => m.score(q.query) >= m.needed);
      gsc = {
        impressions: hits.reduce((n, q) => n + q.impressions, 0),
        clicks: hits.reduce((n, q) => n + q.clicks, 0),
        topQuery: hits.sort((a, b) => b.impressions - a.impressions)[0]?.query ?? null,
      };
    }

    out[it.id] = {
      written,
      clients: it.fieldType === "industry" ? clients.filter((c) => c.industryId === it.fieldKey).map(({ id, name }) => ({ id, name })) : [],
      gsc,
    };
  }
  return out;
}
