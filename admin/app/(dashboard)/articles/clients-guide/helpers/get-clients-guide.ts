import { db } from "@/lib/db";
import { articlesAgreed } from "@/lib/orders/articles-agreed";
import { deliveredArticlesWhere } from "@/lib/orders/delivered-articles-where";

export interface ClientGuideRow {
  id: string;
  name: string;
  planName: string | null;
  articlesPerMonth: number | null;
  serviceMonths: number;
  /** المتّفق عليه في الطلب الساري — `null` بلا طلبٍ أو بلا حصّة. */
  agreed: number | null;
  /** المنشورُ له منذ بداية خدمته — نفس عدّ كرت الطلب. `null` بلا طلبٍ سارٍ: لا دورةَ يُعدّ فيها. */
  delivered: number | null;
  remaining: number | null;
  /** عند العميل في كونسوله ولم يوافق بعد (`AWAITING_APPROVAL`) — حالتُه الآن، لا دورتُه. */
  awaitingApproval: number;
  activatedAt: Date | null;
  /** The content writer on the client (`Client.editorId`) — null when nobody is assigned. */
  writerId: string | null;
  writerName: string | null;
  /** The two halves of `serviceMonths` — for the row's detail panel. */
  paidMonths: number;
  bonusMonths: number;
  serviceStartedAt: Date | null;
  /**
   * The first article counted in «Published» — the earliest `datePublished` since the service
   * started (Khalid, 28 Sep 2026: «نبغى نضيف تاريخ أول مقال نشر»). `null` while none is out.
   */
  firstPublishedAt: Date | null;
  /**
   * Articles in each stage before «published», counted as they stand now (like
   * `awaitingApproval`) — the full pipeline in the row's detail (Khalid, 27 Sep 2026:
   * «ايش قاعد تكتب له، ايش معلّق… البروجرس كامل»).
   */
  pipeline: { writing: number; draft: number; withClient: number; approved: number; changes: number; scheduled: number };
}

export interface GuideWriter {
  /** Staff id, or `"none"` for the clients no writer is assigned to. */
  id: string;
  name: string;
  /** Clients this writer carries — the pill's counter. */
  clients: number;
}

export interface GuidePlan {
  name: string;
  articlesPerMonth: number | null;
  /** عددُ العملاء على الباقة — عدّادُ حبّة الفلتر. */
  clients: number;
}

/**
 * **دليلُ العملاء** (خالد، ٢٤ سبتمبر ٢٠٢٦: «عشان طارق يعرف كل عميل قدّيش عنده، وقدّيش أخذ،
 * وقدّيش باقي، ومتى تفعّل»).
 *
 * لا حسابَ جديد: الطلبُ الساري (`Client.activeOrderId`) مصدرُ الباقة والحصّة ويوم التفعيل،
 * والحصّةُ والمُسلَّم من `lib/orders/` — الملفّان نفساهما اللذان يقرؤهما كرتُ الطلب.
 * العميلُ بلا طلبٍ سارٍ يظهر بشَرطة: لا حصّةَ تُحسب له.
 */
export async function getClientsGuide(): Promise<{ rows: ClientGuideRow[]; plans: GuidePlan[]; writers: GuideWriter[] }> {
  const clients = await db.client.findMany({
    select: { id: true, name: true, activeOrderId: true, editor: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
    take: 500,
  });

  const orderIds = clients.map((c) => c.activeOrderId).filter((id): id is string => Boolean(id));
  const orders = orderIds.length
    ? await db.checkoutOrder.findMany({
        where: { id: { in: orderIds } },
        select: {
          id: true,
          clientId: true,
          planName: true,
          articlesPerMonth: true,
          paidMonths: true,
          bonusServiceMonths: true,
          serviceStartedAt: true,
          activatedAt: true,
        },
      })
    : [];
  const orderById = new Map(orders.map((o) => [o.id, o]));
  // Same rule as `getClientSubscriptions` (the one source for subscriptions): a pointer to an
  // order that belongs to another client is not this client's subscription. Measured 27 Sep
  // 2026: 0 of 43 — the guard keeps this page and the Clients page from ever disagreeing.
  const orderOf = (c: { id: string; activeOrderId: string | null }) => {
    const o = c.activeOrderId ? orderById.get(c.activeOrderId) : undefined;
    return o && o.clientId === c.id ? o : undefined;
  };


  const withOrder = clients.filter((c) => !!orderOf(c));
  // One read per client gives both the «Published» count and the first of those articles —
  // the same set, so the date and the number can never describe different articles.
  const delivered = await Promise.all(
    withOrder.map((c) =>
      db.article.aggregate({
        where: deliveredArticlesWhere(c.id, orderOf(c)!.serviceStartedAt),
        _count: { _all: true },
        _min: { datePublished: true },
      }),
    ),
  );
  const deliveredById = new Map(withOrder.map((c, i) => [c.id, delivered[i]._count._all]));
  const firstPublishedById = new Map(withOrder.map((c, i) => [c.id, delivered[i]._min.datePublished]));

  // عدٌّ واحدٌ مجمَّع لكل العملاء ولكل مرحلة — الحالةُ الآن لا تتقيّد ببداية الخدمة.
  const stages = await db.article.groupBy({
    by: ["clientId", "status"],
    where: { status: { in: ["WRITING", "DRAFT", "AWAITING_APPROVAL", "APPROVED", "NEEDS_REVISION", "SCHEDULED"] } },
    _count: { _all: true },
  });
  const stageCount = new Map(stages.map((g) => [`${g.clientId}:${g.status}`, g._count._all]));
  const stageOf = (clientId: string, status: string) => stageCount.get(`${clientId}:${status}`) ?? 0;

  const rows = clients.map((c) => {
    const order = orderOf(c);
    const agreed = order ? articlesAgreed(order) : null;
    const delivered = order ? (deliveredById.get(c.id) ?? 0) : null;
    return {
      id: c.id,
      name: c.name,
      planName: order?.planName ?? null,
      articlesPerMonth: order?.articlesPerMonth ?? null,
      serviceMonths: order ? order.paidMonths + order.bonusServiceMonths : 0,
      agreed,
      delivered,
      remaining: agreed != null && delivered != null ? agreed - delivered : null,
      activatedAt: order?.activatedAt ?? null,
      awaitingApproval: stageOf(c.id, "AWAITING_APPROVAL"),
      pipeline: {
        writing: stageOf(c.id, "WRITING"),
        draft: stageOf(c.id, "DRAFT"),
        withClient: stageOf(c.id, "AWAITING_APPROVAL"),
        approved: stageOf(c.id, "APPROVED"),
        changes: stageOf(c.id, "NEEDS_REVISION"),
        scheduled: stageOf(c.id, "SCHEDULED"),
      },
      writerId: c.editor?.id ?? null,
      writerName: c.editor ? c.editor.name?.trim() || "Unnamed" : null,
      paidMonths: order?.paidMonths ?? 0,
      bonusMonths: order?.bonusServiceMonths ?? 0,
      serviceStartedAt: order?.serviceStartedAt ?? null,
      firstPublishedAt: firstPublishedById.get(c.id) ?? null,
    };
  });

  // الأكثرُ دَيناً من المقالات أوّلاً — هو ما يُكتب له اليوم؛ ومَن بلا طلبٍ في الآخر.
  rows.sort((a, b) => (b.remaining ?? -Infinity) - (a.remaining ?? -Infinity) || a.name.localeCompare(b.name, "ar"));

  /**
   * الوسومُ فوق الجدول تعرّف الباقات: اسمُها وكم مقالاً في شهرها — من تعريف الباقة
   * (`CommercialPlan`)، فلا يتكرّر الرقمُ في كلّ صفّ (خالد، ٢٤ سبتمبر ٢٠٢٦). والجدولُ يبقى
   * على العقد (Agreed من الطلب).
   * باقةٌ على طلبٍ وليست في التعريفات (مثل «مجاني») تأخذ رقمَ طلباتها إن اتّفقت.
   */
  const defs = await db.commercialPlan.findMany({
    select: { name: true, articlesPerMonth: true },
    orderBy: { displayOrder: "asc" },
  });
  const defByName = new Map(defs.map((d) => [d.name, d.articlesPerMonth]));
  const orphanQuotas = new Map<string, Set<number | null>>();
  for (const r of rows) {
    if (!r.planName || defByName.has(r.planName)) continue;
    orphanQuotas.set(r.planName, (orphanQuotas.get(r.planName) ?? new Set()).add(r.articlesPerMonth));
  }
  const planQuota = (name: string) =>
    defByName.has(name) ? (defByName.get(name) ?? null) : orphanQuotas.get(name)?.size === 1 ? [...orphanQuotas.get(name)!][0] : null;

  const clientsByPlan = new Map<string, number>();
  for (const r of rows) if (r.planName) clientsByPlan.set(r.planName, (clientsByPlan.get(r.planName) ?? 0) + 1);
  const plans: GuidePlan[] = [
    ...defs
      .filter((d) => clientsByPlan.has(d.name))
      .map((d) => ({ name: d.name, articlesPerMonth: d.articlesPerMonth, clients: clientsByPlan.get(d.name)! })),
    ...[...orphanQuotas.keys()].map((name) => ({ name, articlesPerMonth: planQuota(name), clients: clientsByPlan.get(name)! })),
  ];
  /**
   * The writers above the table (Khalid, 27 Sep 2026: «أسامي الكتّاب تكون فوق… نفلتر عليها»):
   * each writer with how many clients they carry, busiest first, then the unassigned ones —
   * a client with nobody on it is the gap this row should make visible.
   */
  const byWriter = new Map<string, GuideWriter>();
  let unassigned = 0;
  for (const c of clients) {
    if (!c.editor) { unassigned++; continue; }
    const w = byWriter.get(c.editor.id) ?? { id: c.editor.id, name: c.editor.name?.trim() || "Unnamed", clients: 0 };
    w.clients++;
    byWriter.set(c.editor.id, w);
  }
  const writers: GuideWriter[] = [
    ...[...byWriter.values()].sort((a, b) => b.clients - a.clients || a.name.localeCompare(b.name, "ar")),
    ...(unassigned ? [{ id: "none", name: "No writer", clients: unassigned }] : []),
  ];

  return { rows, plans, writers };
}
