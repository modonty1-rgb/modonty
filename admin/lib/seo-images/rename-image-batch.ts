"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveImageSeo } from "@/app/(dashboard)/media/actions/save-image-seo";

/**
 * STAGE TWO: turn reviewed alt text into the file name on Bunny, for a slice of images.
 *
 * It does NOT reimplement the rename. It calls `saveImageSeo` with each row's OWN stored
 * text, which re-runs the one code path that already knows the hard parts: the three
 * aspect crops must move with the base or the JSON-LD crop URLs 404; an image whose URL
 * is hard-coded in article body HTML must be refused; the owning client's and article's
 * SEO must be regenerated and modonty's cache tags busted. Duplicating any of that would
 * mean two renamers drifting apart after the first edit to either.
 *
 * Passing the stored text back is safe: the uniqueness check excludes the row itself
 * (`id: { not: mediaId }`), so re-saving unchanged text is not a self-clash.
 *
 * TWO GATES, and both refuse rather than warn:
 *
 *  1. PRODUCTION ONLY. Bunny has no development copy — one set of zones
 *     (`modonty-clients` / `modonty-asset`) serves every environment. Running this
 *     against a local database would move REAL files using rows that do not match
 *     production (measured 2026-09-03: 870 media rows on production, 810 on dev), and
 *     a mismatch here shows up as a broken image on the live site.
 *  2. NO MACHINE DRAFTS. A row still carrying `seoDraftedByAiAt` has not been read by
 *     anyone, and the file name is derived from that unread text. Renaming is a copy
 *     then a delete: the old URL dies, Google has to recrawl, and the name it lands on
 *     came from a sentence nobody checked.
 */

/** Bounded per call: each rename is a copy+delete on storage plus crop moves. */
const MAX_PER_CALL = 5;

export interface RenameBatchResult {
  renamed: number;
  /** Refused or failed, each with the reason — a silent skip would read as success. */
  failed: { id: string; error: string }[];
}

/** True only when the connection string names the production database. */
function isProductionDb(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return /mongodb\.net\/modonty(\?|$)/.test(url);
}

export async function renameImageBatch(
  ids: string[],
): Promise<{ success: true; result: RenameBatchResult } | { success: false; error: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };

  if (!isProductionDb()) {
    return {
      success: false,
      error:
        "التسمية تعمل على الإنتاج فقط. بني ليس له نسخة تطوير — التسمية من قاعدة محلية تحرّك ملفات حقيقية بصفوف لا تطابق الإنتاج.",
    };
  }

  if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: "لا صور محدَّدة" };
  if (ids.length > MAX_PER_CALL) return { success: false, error: `الحد ${MAX_PER_CALL} صور في النداء` };
  if (!ids.every((id) => /^[0-9a-fA-F]{24}$/.test(id))) return { success: false, error: "معرّف غير صالح" };

  const result: RenameBatchResult = { renamed: 0, failed: [] };

  for (const id of ids) {
    const media = await db.media.findUnique({
      where: { id },
      select: { altText: true, description: true, title: true, seoDraftedByAiAt: true },
    });
    if (!media) {
      result.failed.push({ id, error: "الصورة غير موجودة" });
      continue;
    }
    if (media.seoDraftedByAiAt) {
      result.failed.push({ id, error: "مسوّدة آلة لم تُراجَع بعد — عدّل النصّ أولاً" });
      continue;
    }
    if (!(media.altText ?? "").trim()) {
      result.failed.push({ id, error: "بلا نصّ بديل — لا اسم يُشتقّ منه" });
      continue;
    }

    const res = await saveImageSeo({
      mediaId: id,
      altText: media.altText,
      description: media.description,
      title: media.title,
    });
    if (res.success) result.renamed++;
    else result.failed.push({ id, error: res.error });
  }

  return { success: true, result };
}
