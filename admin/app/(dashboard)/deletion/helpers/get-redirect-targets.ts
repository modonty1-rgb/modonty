import { db } from "@/lib/db";
import { loadSiteUrl } from "@/lib/seo/site-url";

/** بديلٌ يجوز التحويل له — برابطه العامّ ليفتحه الأدمن ويتأكّد قبل الحذف (خالد ١٦ أكتوبر ٢٠٢٦). */
export type RedirectTarget = { id: string; name: string; subtitle?: string; url: string; searchText: string };
export type RedirectTargets = { article: RedirectTarget[]; client: RedirectTarget[] };

/**
 * البدائل التي يجوز أن يحوَّل لها رابطٌ محذوف — صفحاتها شغّالة فقط (مقال منشور · عميل نشط)،
 * وإلا صار التحويل لصفحة 410. الحذف نفسه يعيد الفحص على الخادم.
 * منفصلة عن صفوف الحذف: صفحة الحذف تعرض المؤرشف والعملاء الفاضين، والبديل يُختار من الشغّال.
 */
export async function getRedirectTargets(): Promise<RedirectTargets> {
  const [site, articles, clients] = await Promise.all([
    loadSiteUrl(),
    db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, client: { select: { name: true } } },
      orderBy: { datePublished: "desc" },
      take: 5000,
    }),
    db.client.findMany({
      where: { subscriptionStatus: "ACTIVE" },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
      take: 2000,
    }),
  ]);
  return {
    article: articles.map((a) => ({
      id: a.id,
      name: a.title,
      subtitle: a.client?.name,
      url: `${site}/articles/${encodeURIComponent(a.slug)}`,
      searchText: `${a.title} ${a.client?.name ?? ""}`,
    })),
    client: clients.map((c) => ({
      id: c.id,
      name: c.name,
      url: `${site}/clients/${encodeURIComponent(c.slug)}`,
      searchText: c.name,
    })),
  };
}
