import "server-only";

import { db } from "@/lib/db";
import { getArticleSeoScoreDetail, ARTICLE_SEO_SELECT } from "@/lib/seo/article-seo-score";

/** Publish requires the REAL SEO score (shared scorer on the generated page) to reach this. */
export const MIN_SEO_SCORE = 60;

export type PublishGateResult = { ok: true } | { ok: false; error: string };

/**
 * The single publish gate — one source of truth for "is this article good enough to go live".
 *
 * It regenerates the JSON-LD + metadata the way the LIVE page will carry them (indexable, with a
 * publish date), then scores THAT with the shared scorer (`computeArticleSeoScore`). So the gate
 * blocks a page whose REAL SEO is failing — not merely one with empty form fields, which is what
 * the old field-completeness check did. On failure the status is never changed here, so nothing
 * is ever published without passing.
 */
export async function assertArticlePublishable(articleId: string): Promise<PublishGateResult> {
  const cur = await db.article.findUnique({
    where: { id: articleId },
    select: { datePublished: true },
  });
  if (!cur) return { ok: false, error: "المقال غير موجود." };

  // The live page will carry a publish date — set it (if missing) so the generated JSON-LD
  // reflects that. Harmless on a not-yet-published article; used as-is when it does publish.
  if (!cur.datePublished) {
    await db.article.update({ where: { id: articleId }, data: { datePublished: new Date() } });
  }

  // Generate exactly what will be published: fresh validated JSON-LD + indexable metadata.
  try {
    const { generateAndSaveJsonLd } = await import("@/lib/seo/jsonld-storage");
    const { generateAndSaveNextjsMetadata } = await import("@/lib/seo/metadata-storage");
    await generateAndSaveJsonLd(articleId);
    await generateAndSaveNextjsMetadata(articleId, { robots: "index, follow" });
  } catch {
    return { ok: false, error: "فشل توليد بيانات السيو قبل النشر — حاول مرة أخرى." };
  }

  // Score the freshly generated, STORED fields — the same number the tables and dashboard show.
  const row = await db.article.findUnique({ where: { id: articleId }, select: ARTICLE_SEO_SELECT });
  if (!row) return { ok: false, error: "المقال غير موجود." };

  const { score, checks } = getArticleSeoScoreDetail(row);
  if (score < MIN_SEO_SCORE) {
    const weak = checks
      .filter((c) => c.status === "error")
      .map((c) => c.label)
      .join(" · ");
    return {
      ok: false,
      error: `درجة السيو ${score}% — الحد الأدنى للنشر ${MIN_SEO_SCORE}%.${weak ? `\nالبنود الناقصة: ${weak}` : ""}`,
    };
  }
  return { ok: true };
}
