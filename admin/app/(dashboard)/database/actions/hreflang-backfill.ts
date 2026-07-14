"use server";

import { db } from "@/lib/db";
import { regenerateNextjsMetadata } from "@/lib/seo/metadata-storage";

/**
 * Backfill hreflang into stored article metadata.
 *
 * Why this exists (live test 2026-07-14): the metadata generator wrote
 * `alternates: { canonical }` and nothing else, so NOT ONE article ever stored an
 * hreflang map — 0 of 56 published. The live page hid the hole by rebuilding the map
 * at request time, so Google always saw it; but the SEO score reads the STORED card,
 * found no languages, and docked 10 META points from every article on the platform.
 *
 * The generator now writes it (metadata-generator.ts). This step brings the articles
 * that were saved before that fix up to the same truth — it simply re-runs the same
 * generator, so there is exactly one rule and no second implementation to drift.
 *
 * Source of truth for the entries: Settings.defaultAlternateLanguages.
 */

export interface HreflangBackfillStats {
  totalArticles: number;
  /** Stored metadata carries no `alternates.languages` — the score is docking these. */
  missing: number;
  sample: Array<{ id: string; title: string }>;
}

interface MetaShape {
  alternates?: { languages?: Record<string, string> | null } | null;
}

const hasHreflang = (meta: unknown): boolean => {
  const langs = (meta as MetaShape | null)?.alternates?.languages;
  return Boolean(langs && typeof langs === "object" && Object.keys(langs).length > 0);
};

export async function getHreflangBackfillStats(): Promise<HreflangBackfillStats> {
  const rows = await db.article.findMany({
    select: { id: true, title: true, nextjsMetadata: true },
    take: 1000,
  });

  const missingRows = rows.filter((r) => r.nextjsMetadata && !hasHreflang(r.nextjsMetadata));

  return {
    totalArticles: rows.length,
    missing: missingRows.length,
    sample: missingRows.slice(0, 5).map((r) => ({ id: r.id, title: r.title })),
  };
}

export interface HreflangBackfillResult {
  attempted: number;
  successful: number;
  failed: number;
}

/**
 * Re-runs the (now-fixed) generator on every article whose stored card has no hreflang.
 * Idempotent: an article that already has it is skipped, so running twice is a no-op.
 * Sequential in small batches — this writes to every article and must not flood the pool.
 */
export async function backfillArticleHreflang(): Promise<HreflangBackfillResult> {
  const rows = await db.article.findMany({
    select: { id: true, nextjsMetadata: true },
    take: 1000,
  });

  const targets = rows.filter((r) => r.nextjsMetadata && !hasHreflang(r.nextjsMetadata));

  let successful = 0;
  let failed = 0;
  const CONCURRENCY = 5;

  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const chunk = targets.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map((t) =>
        regenerateNextjsMetadata(t.id)
          .then((r) => r.success)
          .catch(() => false),
      ),
    );
    for (const ok of results) ok ? successful++ : failed++;
  }

  return { attempted: targets.length, successful, failed };
}
