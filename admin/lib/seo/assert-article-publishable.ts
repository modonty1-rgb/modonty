import "server-only";

import { Prisma } from "@prisma/client";

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
    select: { datePublished: true, dateModified: true, jsonLdStructuredData: true, nextjsMetadata: true },
  });
  if (!cur) return { ok: false, error: "المقال غير موجود." };

  // A gate must not leave a trace when it refuses.
  //
  // This used to WRITE before it decided: `datePublished: new Date()` here, then
  // `robots: "index, follow"` baked into the stored metadata below, and only THEN the score
  // was compared to the threshold. On a refusal the status stayed unpublished — but the row
  // kept a publish date it never earned and a stored card saying "index me". Everything that
  // reads the database afterwards (the sitemap, the JSON-LD, the regeneration cascade) then
  // saw an article that had been published, because that is what the row said.
  //
  // Google, structured data general guidelines: structured data must be "a true
  // representation of the page content", and "Don't mark up content that is not visible to
  // readers of the page." A publish date on a page nobody can read is neither.
  //
  // So the date is computed in memory, handed to the generators for scoring, and committed
  // only after the gate passes. `hadPublishDate` records whether the row already owned one,
  // because a real re-publish must keep its original date rather than take today's.
  const hadPublishDate = Boolean(cur.datePublished);
  const publishDate = cur.datePublished ?? new Date();

  // The blobs are restored on refusal for the same reason. They are regenerated here in the
  // indexable shape the LIVE page will carry, which is the only way to score what will
  // actually ship — but that shape must not survive a refusal.
  const priorJsonLd = cur.jsonLdStructuredData;
  const priorMetadata = cur.nextjsMetadata;

  const restore = async () => {
    try {
      await db.article.update({
        where: { id: articleId },
        data: {
          // `dateModified` is written back to its own value so this restore does not restamp
          // the article as freshly edited — the rule jsonld-storage.ts and metadata-storage.ts
          // already follow for cache writes.
          dateModified: cur.dateModified,
          datePublished: hadPublishDate ? cur.datePublished : null,
          jsonLdStructuredData: priorJsonLd,
          nextjsMetadata: priorMetadata as Prisma.InputJsonValue,
        },
      });
    } catch (e) {
      // The refusal message still reaches the editor; this only records that the row could
      // not be put back, which is the one case where a stale blob outlives a failed gate.
      console.error("assertArticlePublishable: could not restore pre-gate state", articleId, e);
    }
  };

  // Generate exactly what will be published: fresh validated JSON-LD + indexable metadata,
  // with the publish date the live page would carry.
  try {
    await db.article.update({ where: { id: articleId }, data: { datePublished: publishDate } });
    const { generateAndSaveJsonLd } = await import("@/lib/seo/jsonld-storage");
    const { generateAndSaveNextjsMetadata } = await import("@/lib/seo/metadata-storage");
    await generateAndSaveJsonLd(articleId);
    await generateAndSaveNextjsMetadata(articleId, { robots: "index, follow" });
  } catch {
    await restore();
    return { ok: false, error: "فشل توليد بيانات السيو قبل النشر — حاول مرة أخرى." };
  }

  // Score the freshly generated, STORED fields — the same number the tables and dashboard show.
  const row = await db.article.findUnique({ where: { id: articleId }, select: ARTICLE_SEO_SELECT });
  if (!row) {
    await restore();
    return { ok: false, error: "المقال غير موجود." };
  }

  const { score, checks } = getArticleSeoScoreDetail(row);
  if (score < MIN_SEO_SCORE) {
    const weak = checks
      .filter((c) => c.status === "error")
      .map((c) => c.label)
      .join(" · ");
    // The most common refusal of the three, and the one the old code left a publish date behind on.
    await restore();
    return {
      ok: false,
      error: `درجة السيو ${score}% — الحد الأدنى للنشر ${MIN_SEO_SCORE}%.${weak ? `\nالبنود الناقصة: ${weak}` : ""}`,
    };
  }

  // N2 — a featured image without alt text must never reach the index. Alt is optional at
  // upload time (the graphic designer just uploads), so the publish gate is where the
  // "100% before indexing" rule is actually enforced for the image's accessibility signal.
  const featured = await db.article.findUnique({
    where: { id: articleId },
    select: { featuredImage: { select: { altText: true } } },
  });
  if (featured?.featuredImage && !featured.featuredImage.altText?.trim()) {
    await restore();
    return {
      ok: false,
      error: "الصورة الرئيسية بلا نص بديل (alt). أضِف النص البديل من قسم «SEO Images» قبل النشر.",
    };
  }

  return { ok: true };
}
