import { ArticleStatus } from "@prisma/client";
import { db } from "../db";

/**
 * «أيّ مقال — وأيّ نوع مقال — يجيب شغل؟» — المصدر الواحد لصفحة الأدمن (فريق المحتوى، كل العملاء)
 * والكونسول (العميل، عميله فقط عبر `clientId`). مهمّة طارق (٤ أكتوبر ٢٠٢٦).
 *
 * **مبنيّ للحجم (خالد ٦ أكتوبر: «لو عندنا ألف ارتكل… ابنِ الصح»):** العدّ داخل مونغو
 * (`aggregateRaw`) — لا يُسحب نقرٌ ولا طلبٌ ولا قراءةٌ إلى الذاكرة. يعود سطرٌ واحد لكل مقال من
 * كل مصدر، فالكلفة بعدد المقالات لا بعدد الأحداث. والمقالات تُقرأ بحقولها الخمسة فقط.
 *
 * **الإجراءات الأربعة، ولا يُعدّ شيءٌ مرّتين:**
 *  - طلب تواصل ← `booking_requests` قناة form (نموذج أُرسل، لا فتحه).
 *  - واتساب ← **الأكبر** من: نقرات `cta_clicks` إلى wa.me (مرّة لكل زائر في اليوم) و`booking_requests`
 *    قناة whatsapp. لا جمعهما: زرّ المقال يكتب الاثنين لنفس الضغطة (cta-tracked-link.tsx)،
 *    وأيقونة الواتساب تكتب الطلب وحده (whatsapp-icon-link.tsx)، ونقرات dev قبل ٥ أكتوبر كُتبت بلا
 *    طلب. والجلستان مفتاحان مختلفان (modonty_view_sid · جلسة GA4) فلا يُوحَّدان بها.
 *  - اتصال ← نقرة وجهتها `tel:` · رابط ← وجهتها http(s) لموقعٍ غير مدونتي وغير واتساب.
 *
 * **القراءات** من `article_views` في نفس الفترة — مقام نسبة التحويل (إجراءات لكل ١٠٠ قراءة)،
 * فلا يُظلم مقالٌ قرأه مئة أمام مقالٍ قرأه عشرة آلاف.
 */

type Counts = { form: number; whatsapp: number; call: number; link: number; total: number };

export type ArticleActionsRow = Counts & {
  /** = articleId. The admin `DataTable` keys rows — and opens «+» — by `id`. */
  id: string;
  articleId: string;
  title: string;
  slug: string;
  clientId: string;
  clientName: string;
  categoryName: string | null;
  views: number;
  /** إجراءات لكل ١٠٠ قراءة؛ `null` حين لا قراءات في الفترة. */
  rate: number | null;
};

export type CategoryActionsRow = Counts & {
  categoryName: string;
  articles: number;
  articlesWithActions: number;
  views: number;
  rate: number | null;
};

/** One client's totals — the admin page's main row; its articles open under «+». */
export type ClientActionsRow = Counts & {
  /**
   * Contacts with NO article behind them — the visitor reached the client page (or a listing)
   * without reading one of his articles in the last 7 days. Same four actions, same rules. Kept
   * apart from `total` so «Articles brought N» stays the articles' number (Khalid, 7 Oct 2026).
   */
  direct: Omit<Counts, "total"> & { total: number };
  /** = clientId — the admin `DataTable` keys rows by `id`. */
  id: string;
  clientId: string;
  clientName: string;
  articles: number;
  articlesWithActions: number;
  views: number;
  rate: number | null;
};

export type ArticleActions = {
  days: number;
  rows: ArticleActionsRow[];
  byCategory: CategoryActionsRow[];
  byClient: ClientActionsRow[];
  totals: Counts & { views: number; rate: number | null; articles: number; articlesWithActions: number };
};

export const NO_CATEGORY = "بلا تصنيف";

/**
 * أقلّ قراءات تُعرض عندها نسبة التحويل. تحتها النسبة ضجيج: على dev جاب تصنيفٌ ٦ إجراءات من
 * قراءتين فطلعت «٣٠٠٪» (مقيس ٧ أكتوبر). يُطبَّق في الترتيب «الأعلى تحويلاً» وفي عرض النسبة معاً.
 */
export const MIN_VIEWS_FOR_RATE = 20;

type Oid = { $oid: string };
const oidOf = (v: unknown): string | null =>
  v && typeof v === "object" && "$oid" in (v as Oid) ? (v as Oid).$oid : typeof v === "string" ? v : null;
const num = (v: unknown): number => (typeof v === "number" ? v : v && typeof v === "object" && "$numberLong" in v ? Number((v as { $numberLong: string }).$numberLong) : 0);

const rateOf = (actions: number, views: number) => (views > 0 ? (actions / views) * 100 : null);

/** وجهة النقرة ← نوع الإجراء، داخل مونغو. نفس القواعد المكتوبة أعلاه. */
const CLICK_KIND = {
  $let: {
    vars: { u: { $ifNull: ["$targetUrl", ""] } },
    in: {
      $switch: {
        branches: [
          { case: { $regexMatch: { input: "$$u", regex: "^tel:" } }, then: "call" },
          { case: { $regexMatch: { input: "$$u", regex: "^https?://(www\\.)?(wa\\.me|([a-z0-9-]+\\.)*whatsapp\\.com)([/:?#]|$)", options: "i" } }, then: "whatsapp" },
          { case: { $regexMatch: { input: "$$u", regex: "^https?://(www\\.)?modonty\\.com([/:?#]|$)", options: "i" } }, then: "skip" },
          { case: { $regexMatch: { input: "$$u", regex: "^https?://", options: "i" } }, then: "link" },
        ],
        default: "skip",
      },
    },
  },
};

export async function getArticleActions({ clientId, days = 30 }: { clientId?: string; days?: number } = {}): Promise<ArticleActions> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const sinceJson = { $date: since.toISOString() };
  const scope = { articleId: { $ne: null }, createdAt: { $gte: sinceJson }, ...(clientId ? { clientId: { $oid: clientId } } : {}) };

  const [articles, clickRows, bookingRows] = await Promise.all([
    db.article.findMany({
      where: { status: ArticleStatus.PUBLISHED, ...(clientId ? { clientId } : {}) },
      select: { id: true, title: true, slug: true, clientId: true, client: { select: { name: true } }, category: { select: { name: true } } },
    }),
    db.cTAClick.aggregateRaw({
      pipeline: [
        { $match: scope },
        { $project: { articleId: 1, kind: CLICK_KIND, visit: { $concat: [{ $ifNull: ["$sessionId", { $toString: "$_id" }] }, "|", { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } }] } } },
        { $match: { kind: { $ne: "skip" } } },
        // واتساب مرّة لكل زائر في اليوم؛ الاتصال والرابط كل نقرة.
        { $group: { _id: { a: "$articleId", k: "$kind", v: { $cond: [{ $eq: ["$kind", "whatsapp"] }, "$visit", { $toString: "$_id" }] } } } },
        { $group: { _id: { a: "$_id.a", k: "$_id.k" }, n: { $sum: 1 } } },
      ],
    }),
    db.bookingRequest.aggregateRaw({
      pipeline: [{ $match: scope }, { $group: { _id: { a: "$articleId", c: "$channel" }, n: { $sum: 1 } } }],
    }),
  ]);

  // Contacts with no article: the client page, the listings. One row per client per kind.
  const directScope = { articleId: null, clientId: clientId ? { $oid: clientId } : { $ne: null }, createdAt: { $gte: sinceJson } };
  const [directClickRows, directBookingRows] = await Promise.all([
    db.cTAClick.aggregateRaw({
      pipeline: [
        { $match: directScope },
        { $project: { clientId: 1, kind: CLICK_KIND, visit: { $concat: [{ $ifNull: ["$sessionId", { $toString: "$_id" }] }, "|", { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } }] } } },
        { $match: { kind: { $ne: "skip" } } },
        { $group: { _id: { c: "$clientId", k: "$kind", v: { $cond: [{ $eq: ["$kind", "whatsapp"] }, "$visit", { $toString: "$_id" }] } } } },
        { $group: { _id: { c: "$_id.c", k: "$_id.k" }, n: { $sum: 1 } } },
      ],
    }),
    db.bookingRequest.aggregateRaw({
      pipeline: [{ $match: directScope }, { $group: { _id: { c: "$clientId", ch: "$channel" }, n: { $sum: 1 } } }],
    }),
  ]);
  const direct = new Map<string, { form: number; clickWa: number; leadWa: number; call: number; link: number }>();
  const dAt = (id: string) => {
    let d = direct.get(id);
    if (!d) direct.set(id, (d = { form: 0, clickWa: 0, leadWa: 0, call: 0, link: 0 }));
    return d;
  };
  for (const r of directClickRows as unknown as { _id: { c: unknown; k: string }; n: unknown }[]) {
    const id = oidOf(r._id.c);
    if (!id) continue;
    if (r._id.k === "call") dAt(id).call += num(r.n);
    else if (r._id.k === "link") dAt(id).link += num(r.n);
    else if (r._id.k === "whatsapp") dAt(id).clickWa += num(r.n);
  }
  for (const r of directBookingRows as unknown as { _id: { c: unknown; ch: string }; n: unknown }[]) {
    const id = oidOf(r._id.c);
    if (!id) continue;
    if (r._id.ch === "whatsapp") dAt(id).leadWa += num(r.n);
    else dAt(id).form += num(r.n);
  }
  const directOf = (id: string) => {
    const d = direct.get(id);
    const form = d?.form ?? 0;
    const whatsapp = Math.max(d?.clickWa ?? 0, d?.leadWa ?? 0);
    const call = d?.call ?? 0;
    const link = d?.link ?? 0;
    return { form, whatsapp, call, link, total: form + whatsapp + call + link };
  };

  const articleIds = articles.map((a) => ({ $oid: a.id }));
  const viewRows = articleIds.length
    ? await db.articleView.aggregateRaw({
        pipeline: [
          // `articleId $in` + `createdAt` rides the `[articleId, createdAt]` index — a match on the
          // date alone would scan every view ever recorded.
          { $match: { articleId: { $in: articleIds }, createdAt: { $gte: sinceJson } } },
          { $group: { _id: "$articleId", n: { $sum: 1 } } },
        ],
      })
    : [];

  const counts = new Map<string, { form: number; clickWa: number; leadWa: number; call: number; link: number }>();
  const at = (id: string) => {
    let c = counts.get(id);
    if (!c) counts.set(id, (c = { form: 0, clickWa: 0, leadWa: 0, call: 0, link: 0 }));
    return c;
  };
  for (const r of clickRows as unknown as { _id: { a: unknown; k: string }; n: unknown }[]) {
    const id = oidOf(r._id.a);
    if (!id) continue;
    if (r._id.k === "call") at(id).call += num(r.n);
    else if (r._id.k === "link") at(id).link += num(r.n);
    else if (r._id.k === "whatsapp") at(id).clickWa += num(r.n);
  }
  for (const r of bookingRows as unknown as { _id: { a: unknown; c: string }; n: unknown }[]) {
    const id = oidOf(r._id.a);
    if (!id) continue;
    if (r._id.c === "whatsapp") at(id).leadWa += num(r.n);
    else at(id).form += num(r.n);
  }
  const views = new Map<string, number>();
  for (const r of viewRows as unknown as { _id: unknown; n: unknown }[]) {
    const id = oidOf(r._id);
    if (id) views.set(id, num(r.n));
  }

  const rows: ArticleActionsRow[] = articles.map((a) => {
    const c = counts.get(a.id);
    const form = c?.form ?? 0;
    const whatsapp = Math.max(c?.clickWa ?? 0, c?.leadWa ?? 0);
    const call = c?.call ?? 0;
    const link = c?.link ?? 0;
    const total = form + whatsapp + call + link;
    const v = views.get(a.id) ?? 0;
    return {
      id: a.id,
      articleId: a.id,
      title: a.title,
      slug: a.slug,
      clientId: a.clientId,
      clientName: a.client?.name ?? "—",
      categoryName: a.category?.name ?? null,
      form,
      whatsapp,
      call,
      link,
      total,
      views: v,
      rate: rateOf(total, v),
    };
  });

  const cats = new Map<string, CategoryActionsRow>();
  for (const r of rows) {
    const name = r.categoryName ?? NO_CATEGORY;
    const c = cats.get(name) ?? { categoryName: name, articles: 0, articlesWithActions: 0, form: 0, whatsapp: 0, call: 0, link: 0, total: 0, views: 0, rate: null };
    c.articles += 1;
    if (r.total > 0) c.articlesWithActions += 1;
    c.form += r.form;
    c.whatsapp += r.whatsapp;
    c.call += r.call;
    c.link += r.link;
    c.total += r.total;
    c.views += r.views;
    cats.set(name, c);
  }
  const byCategory = [...cats.values()]
    .map((c) => ({ ...c, rate: rateOf(c.total, c.views) }))
    .sort((x, y) => y.total - x.total || y.views - x.views);

  const clients = new Map<string, ClientActionsRow>();
  for (const r of rows) {
    const c = clients.get(r.clientId) ?? { id: r.clientId, clientId: r.clientId, clientName: r.clientName, articles: 0, articlesWithActions: 0, form: 0, whatsapp: 0, call: 0, link: 0, total: 0, views: 0, rate: null, direct: directOf(r.clientId) };
    c.articles += 1;
    if (r.total > 0) c.articlesWithActions += 1;
    c.form += r.form;
    c.whatsapp += r.whatsapp;
    c.call += r.call;
    c.link += r.link;
    c.total += r.total;
    c.views += r.views;
    clients.set(r.clientId, c);
  }
  const byClient = [...clients.values()]
    .map((c) => ({ ...c, rate: rateOf(c.total, c.views) }))
    .sort((x, y) => y.total - x.total || y.direct.total - x.direct.total || y.views - x.views);

  const t = rows.reduce(
    (s, r) => ({ form: s.form + r.form, whatsapp: s.whatsapp + r.whatsapp, call: s.call + r.call, link: s.link + r.link, total: s.total + r.total, views: s.views + r.views, withActions: s.withActions + (r.total > 0 ? 1 : 0) }),
    { form: 0, whatsapp: 0, call: 0, link: 0, total: 0, views: 0, withActions: 0 },
  );

  return {
    days,
    rows,
    byCategory,
    byClient,
    totals: { form: t.form, whatsapp: t.whatsapp, call: t.call, link: t.link, total: t.total, views: t.views, rate: rateOf(t.total, t.views), articles: rows.length, articlesWithActions: t.withActions },
  };
}
