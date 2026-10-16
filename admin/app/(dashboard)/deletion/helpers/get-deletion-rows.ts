import { db } from "@/lib/db";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { getArticleDeleteBlockers } from "@/lib/deletion/get-article-delete-blockers";
import { getCategoryDeleteBlockers } from "@/lib/deletion/get-category-delete-blockers";
import { getClientDeleteBlockers } from "@/lib/deletion/get-client-delete-blockers";
import { getIndustryDeleteBlockers } from "@/lib/deletion/get-industry-delete-blockers";
import { getTagDeleteBlockers } from "@/lib/deletion/get-tag-delete-blockers";
import { getReelDeleteBlockers } from "@/lib/deletion/get-reel-delete-blockers";
import { IS_ARCHIVED } from "@modonty/shared/lib/taxonomy/not-archived";

import { getArchivedArticleFacts, type RowFact } from "./get-archived-article-facts";

const D = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", year: "numeric" });
const SUBSCRIPTION: Record<string, string> = { ACTIVE: "نشط", PENDING: "بانتظار التفعيل", EXPIRED: "منتهي", CANCELLED: "ملغي" };

export type DeletionKind = "client" | "article" | "reel" | "category" | "tag" | "industry";

/** «delete» يمسح الصفّ · «archive» يسحبه من جوجل ويبقيه (مقال منشور · ريل منشور). */
export type DeletionAction = "delete" | "archive";

export type DeletionRow = {
  id: string;
  kind: DeletionKind;
  name: string;
  /** رابطه في مدونتي — هو اللي يصير 410 عند جوجل بعد الحذف. */
  publicUrl: string;
  adminHref: string;
  /** صفحته شغّالة الحين عند جوجل (عميل نشط · مقال منشور · تصنيف/وسم/صناعة موجودة). */
  live: boolean;
  blockers: string[];
  actions: DeletionAction[];
  /** سطر تحت الاسم في الصفّ (العميل غالباً). */
  subtitle?: string;
  /** شجرة التصنيفات: 0 رئيسي · 1 فرعي — يُعرض الفرعي بإزاحة تحت أبيه (خالد ١٦ أكتوبر ٢٠٢٦). */
  level?: 0 | 1;
  /** تفاصيل «+» — للمقال المؤرشف: الكاتب والعميل والتواريخ والمشاهدات. */
  facts: RowFact[];
  searchText: string;
};

/** كل ما يُحذف ويؤثّر على السيو، مع أسباب منع كل صفّ — نفس الدوال التي يفحص بها الحذف نفسه. */
export async function getDeletionRows(): Promise<DeletionRow[]> {
  // عميل دفع مبلغاً ما يطلع هنا — إلغاؤه استرجاع لا حذف (خالد ١٦ أكتوبر ٢٠٢٦: «ما احتاجهم يجوا في القائمة عشان ما اتلخبط»).
  const paid = await db.checkoutOrder.findMany({ where: { totalMinor: { gt: 0 }, clientId: { not: null } }, select: { clientId: true }, take: 5000 });
  const paidClientIds = [...new Set(paid.map((o) => o.clientId as string))];

  const [site, clients, articles, reels, categories, tags, industries] = await Promise.all([
    loadSiteUrl(),
    // يطلع هنا فقط العميل اللي ما انكتب له مقال وما دفع شي (لا طلب بمبلغ ولا فاتورة) —
    // الموانع نفسها باقية في الحذف على الخادم.
    db.client.findMany({
      where: { articles: { none: {} }, invoices: { none: {} }, id: { notIn: paidClientIds } },
      select: { id: true, name: true, slug: true, subscriptionStatus: true, createdAt: true },
      orderBy: { name: "asc" },
      take: 2000,
    }),
    // المؤرشف فقط: الأرشفة قرار الكاتب من صفحة المقال، والحذف هنا تنظيف للقاعدة بعدها.
    db.article.findMany({
      where: { status: "ARCHIVED" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        datePublished: true,
        viewsCount: true,
        wordCount: true,
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    }),
    // المسحوب فقط: السحب قرار الفريق من صفحة الريلز، والحذف هنا تنظيف بعده («زي المقالات»).
    db.media.findMany({
      where: { reelStatus: "ARCHIVED" },
      select: {
        id: true,
        title: true,
        reelSlug: true,
        reelPublishedAt: true,
        updatedAt: true,
        mimeType: true,
        viewsCount: true,
        commentsCount: true,
        likesCount: true,
        client: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 3000,
    }),
    // تصنيف رئيسي تحته فرعيات ما يطلع هنا أصلاً (خالد ١٦ أكتوبر ٢٠٢٦) — والمانع نفسه باقٍ في الحذف على الخادم.
    db.category.findMany({
      where: { children: { none: {} }, ...IS_ARCHIVED },
      select: { id: true, name: true, slug: true, parent: { select: { name: true } }, _count: { select: { articles: true } } },
      orderBy: { name: "asc" },
      take: 1000,
    }),
    // التصنيف والوسم والصناعة: المؤرشف فقط — «نفس المنطق» (خالد ١٦ أكتوبر ٢٠٢٦): الفريق يأرشف، والأدمن يحذف هنا.
    db.tag.findMany({ where: IS_ARCHIVED, select: { id: true, name: true, slug: true }, orderBy: { name: "asc" }, take: 3000 }),
    db.industry.findMany({ where: IS_ARCHIVED, select: { id: true, name: true, slug: true }, orderBy: { name: "asc" }, take: 1000 }),
  ]);

  const [clientWhy, articleWhy, categoryWhy, tagWhy, industryWhy, articleFacts, reelWhy, reelLogs] = await Promise.all([
    getClientDeleteBlockers(clients.map((r) => r.id)),
    getArticleDeleteBlockers(articles.map((r) => r.id)),
    getCategoryDeleteBlockers(categories.map((r) => r.id)),
    getTagDeleteBlockers(tags.map((r) => r.id)),
    getIndustryDeleteBlockers(industries.map((r) => r.id)),
    getArchivedArticleFacts(articles),
    getReelDeleteBlockers(reels.map((r) => r.id)),
    // مَن سحب الريل ومتى — يُسجَّل من ١٦ أكتوبر ٢٠٢٦؛ قبلها يُقال صراحةً إنه غير مسجّل.
    db.auditLog.findMany({
      where: { action: "reel.archive", entityId: { in: reels.map((r) => r.id) } },
      select: { entityId: true, userName: true, userEmail: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5000,
    }),
  ]);
  const N = new Intl.NumberFormat("ar-EG");
  const pulledBy = new Map<string, string>();
  for (const l of reelLogs) if (l.entityId && !pulledBy.has(l.entityId)) pulledBy.set(l.entityId, `${D.format(l.createdAt)} — ${l.userName ?? l.userEmail}`);

  const url = (section: string, slug: string) => `${site}/${section}/${encodeURIComponent(slug)}`;

  // يُعرض فقط ما ينقدر يُحذف (خالد ١٦ أكتوبر ٢٠٢٦: «ما حنقدر نحذفها، طب ليش نعرضها؟»).
  // الموانع تُحسب هنا لهذا الفرز، وتُعاد على الخادم عند الحذف نفسه.
  const rows: DeletionRow[] = [
    ...clients.map((r): DeletionRow => ({
      id: r.id, kind: "client" as const, name: r.name, publicUrl: url("clients", r.slug), adminHref: `/clients/${r.id}`,
      live: r.subscriptionStatus === "ACTIVE", blockers: clientWhy.get(r.id) ?? [], actions: ["delete"], searchText: `${r.name} ${r.slug}`,
      facts: [
        { label: "سُجّل", value: D.format(r.createdAt) },
        { label: "الاشتراك", value: SUBSCRIPTION[r.subscriptionStatus] ?? r.subscriptionStatus },
        { label: "المقالات", value: "ولا مقال" },
        { label: "المدفوع", value: "صفر" },
      ],
    })),
    ...articles.map((r): DeletionRow => ({
      id: r.id, kind: "article" as const, name: r.title, publicUrl: url("articles", r.slug), adminHref: `/articles/${r.id}`,
      live: r.status === "PUBLISHED", blockers: articleWhy.get(r.id) ?? [], actions: ["delete"], subtitle: r.client?.name, facts: articleFacts.get(r.id) ?? [], searchText: `${r.title} ${r.slug} ${r.client?.name ?? ""}`,
    })),
    ...reels.map((r): DeletionRow => ({
      id: r.id, kind: "reel" as const, name: r.title?.trim() || "ريل بلا عنوان",
      publicUrl: url("reels", r.reelSlug ?? ""), adminHref: "/reels",
      live: false, blockers: reelWhy.get(r.id) ?? [], actions: ["delete"], subtitle: r.client?.name,
      searchText: `${r.title ?? ""} ${r.reelSlug ?? ""} ${r.client?.name ?? ""}`,
      facts: [
        { label: "العميل", value: r.client?.name ?? "—" },
        { label: "النوع", value: r.mimeType.startsWith("video/") ? "فيديو" : "صورة" },
        { label: "انتشر", value: r.reelPublishedAt ? D.format(r.reelPublishedAt) : "ما انتشر أبداً" },
        { label: "السحب", value: pulledBy.get(r.id) ?? `غير مسجّل · آخر تعديل ${D.format(r.updatedAt)}` },
        { label: "المشاهدات", value: N.format(r.viewsCount) },
        { label: "التفاعل", value: `${N.format(r.likesCount)} إعجاب · ${N.format(r.commentsCount)} تعليق` },
      ],
    })),
    // الرئيسي اللي تحته فرعيات مستبعد من الاستعلام، فالباقي أوراق: رئيسي بلا فرعيات، أو فرعي يُذكر أبوه.
    ...categories.map((c): DeletionRow => ({
      id: c.id, kind: "category" as const, name: c.name, publicUrl: url("categories", c.slug), adminHref: `/categories/${c.id}`,
      live: false, blockers: categoryWhy.get(c.id) ?? [], actions: ["delete"],
      level: c.parent ? 1 : 0,
      subtitle: c.parent ? `فرعي تحت: ${c.parent.name}` : "رئيسي",
      facts: [
        { label: "المستوى", value: c.parent ? `فرعي تحت «${c.parent.name}»` : "رئيسي بلا فرعيات" },
        { label: "المقالات", value: N.format(c._count.articles) },
      ],
      searchText: `${c.name} ${c.slug} ${c.parent?.name ?? ""}`,
    })),
    ...tags.map((r): DeletionRow => ({
      id: r.id, kind: "tag" as const, name: r.name, publicUrl: url("tags", r.slug), adminHref: `/tags/${r.id}`,
      live: false, blockers: tagWhy.get(r.id) ?? [], actions: ["delete"], facts: [], searchText: `${r.name} ${r.slug}`,
    })),
    ...industries.map((r): DeletionRow => ({
      id: r.id, kind: "industry" as const, name: r.name, publicUrl: url("industries", r.slug), adminHref: `/industries/${r.id}`,
      live: false, blockers: industryWhy.get(r.id) ?? [], actions: ["delete"], facts: [], searchText: `${r.name} ${r.slug}`,
    })),
  ];
  return rows.filter((r) => r.blockers.length === 0);
}

