"use server";

import { db } from "@/lib/db";

import { requireDeleteAdmin } from "./require-delete-admin";

export type InboundKind = "client" | "article" | "reel" | "category" | "tag" | "industry";

export type InboundLinks = { count: number; items: { title: string; adminHref: string }[] };

const SECTION: Record<InboundKind, string> = {
  client: "clients",
  article: "articles",
  reel: "reels",
  category: "categories",
  tag: "tags",
  industry: "industries",
};

async function slugOf(kind: InboundKind, id: string): Promise<string | null> {
  switch (kind) {
    case "client":
      return (await db.client.findUnique({ where: { id }, select: { slug: true } }))?.slug ?? null;
    case "article":
      return (await db.article.findUnique({ where: { id }, select: { slug: true } }))?.slug ?? null;
    case "reel":
      return (await db.media.findUnique({ where: { id }, select: { reelSlug: true } }))?.reelSlug ?? null;
    case "category":
      return (await db.category.findUnique({ where: { id }, select: { slug: true } }))?.slug ?? null;
    case "tag":
      return (await db.tag.findUnique({ where: { id }, select: { slug: true } }))?.slug ?? null;
    case "industry":
      return (await db.industry.findUnique({ where: { id }, select: { slug: true } }))?.slug ?? null;
  }
}

/**
 * المقالات المنشورة التي تربط لهذه الصفحة داخل نصّها — جوجل يوصي بتعديل الروابط الداخلية
 * قبل إزالة صفحة («replace all URLs that pointed to your own pages»)، فتُعرض في نافذة التأكيد.
 * يُبحث عن المسار بشكليه: العربي كما هو، والمرمَّز (%D8…) كما يكتبه المحرّر أحياناً.
 */
export async function getInboundLinks(kind: InboundKind, id: string): Promise<InboundLinks> {
  if (await requireDeleteAdmin()) return { count: 0, items: [] };
  const slug = await slugOf(kind, id);
  if (!slug) return { count: 0, items: [] };

  const section = SECTION[kind];
  const paths = [...new Set([`/${section}/${slug}`, `/${section}/${encodeURIComponent(slug)}`])];
  const where = {
    status: "PUBLISHED" as const,
    ...(kind === "article" ? { id: { not: id } } : {}),
    OR: paths.map((p) => ({ content: { contains: p } })),
  };
  // `contains` يجيب المرشّحين، والحدّ يُفحص هنا: «/clients/عيادة» بادئةُ «/clients/عيادة-علاج-الألم»
  // (عميلان مختلفان على الإنتاج) — بلا هذا الفحص يُعدّ رابط عميلٍ آخر رابطاً لهذا.
  const candidates = await db.article.findMany({ where, select: { id: true, title: true, content: true }, take: 300 });
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const exact = new RegExp(`(?:${paths.map(esc).join("|")})(?=["'/?#)\\s<]|$)`);
  const hits = candidates.filter((r) => exact.test(r.content));
  return {
    count: hits.length,
    items: hits.slice(0, 10).map((r) => ({ title: r.title, adminHref: `/articles/${r.id}/edit` })),
  };
}
