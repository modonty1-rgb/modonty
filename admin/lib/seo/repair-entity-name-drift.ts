import { db } from "@/lib/db";

import { batchRegenerateArticleSeo } from "./batch-regenerate-article-seo";

/**
 * Finds articles whose STORED SEO blobs still carry an entity's OLD name, and rebuilds them.
 *
 * Why this is needed. Merging a tag, a category or an industry runs in three phases: the
 * database move (one transaction, server-side), the per-article SEO rebuild (a `for` loop in
 * the BROWSER, so the editor sees a progress bar), and the finalize. Close the tab mid-loop
 * and phase 1 has happened, some articles were rebuilt, and phase 3 never ran. The articles
 * left behind keep the pre-merge name in `jsonLdStructuredData` and `nextjsMetadata` — and
 * nothing detects it: `getArticlesNeedingRegeneration` compares timestamps, and a merge never
 * touches the Article row, so its `dateModified` does not move. The existing repair
 * (`regenerateAllStaleJsonLd`) only looks for a wrong host in the URL, not a wrong name.
 *
 * The detection is the blob itself: an article linked to a tag whose stored SEO does not
 * contain that tag's CURRENT name was not rebuilt after the rename. No new column, no job
 * record, and it is idempotent — running it twice on a healthy library rebuilds nothing.
 *
 * It is a sweep, not a merge-specific resume: the same drift appears whenever any rename
 * cascade is interrupted, whatever interrupted it.
 */

/** Rebuilt articles and how many were found drifting, so a caller can report both. */
export interface NameDriftRepairResult {
  drifted: number;
  successful: number;
  failed: number;
}

/** An entity name is "present" if it appears in either stored blob. */
function blobsCarry(name: string, jsonLd: string | null, metadata: unknown): boolean {
  if (jsonLd && jsonLd.includes(name)) return true;
  if (metadata && JSON.stringify(metadata).includes(name)) return true;
  return false;
}

export async function repairEntityNameDrift(): Promise<NameDriftRepairResult> {
  const driftedIds = new Set<string>();

  // ── Tags ────────────────────────────────────────────────────────────────────
  // Read the link rows with both sides, so one pass covers every tag at once rather than
  // one query per tag.
  const tagLinks = await db.articleTag.findMany({
    select: {
      articleId: true,
      tag: { select: { name: true } },
      article: {
        select: { id: true, status: true, jsonLdStructuredData: true, nextjsMetadata: true },
      },
    },
  });
  for (const link of tagLinks) {
    const a = link.article;
    // Only published articles matter: a draft is rebuilt on its way out anyway, and
    // flagging drafts would make the count noise the editor learns to ignore.
    if (!a || a.status !== "PUBLISHED") continue;
    // An article that has never been generated is not "drifted" — it is simply not built,
    // which is a different problem with a different repair.
    if (!a.jsonLdStructuredData && !a.nextjsMetadata) continue;
    const name = link.tag?.name?.trim();
    if (!name) continue;
    if (!blobsCarry(name, a.jsonLdStructuredData, a.nextjsMetadata)) driftedIds.add(a.id);
  }

  // ── Categories ──────────────────────────────────────────────────────────────
  const categorised = await db.article.findMany({
    where: { status: "PUBLISHED", categoryId: { not: null } },
    select: {
      id: true,
      jsonLdStructuredData: true,
      nextjsMetadata: true,
      category: { select: { name: true } },
    },
  });
  for (const a of categorised) {
    if (!a.jsonLdStructuredData && !a.nextjsMetadata) continue;
    const name = a.category?.name?.trim();
    if (!name) continue;
    if (!blobsCarry(name, a.jsonLdStructuredData, a.nextjsMetadata)) driftedIds.add(a.id);
  }

  if (driftedIds.size === 0) return { drifted: 0, successful: 0, failed: 0 };

  const batch = await batchRegenerateArticleSeo([...driftedIds]);
  return { drifted: driftedIds.size, successful: batch.successful, failed: batch.failed };
}
