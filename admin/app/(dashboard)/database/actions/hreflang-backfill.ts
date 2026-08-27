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
  /** Every article in the database — counted, not capped. */
  totalArticles: number;
  /** How many of them this pass actually read. Below `totalArticles` = the rest went unexamined. */
  scanned: number;
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
  // The cap is real, so it is REPORTED rather than hidden. This read `take: 1000` and then
  // handed the caller `rows.length` as `totalArticles` — so past a thousand articles the
  // screen would say "1000 articles, 0 wrong" while the rest of the library went unexamined.
  // A silent truncation reads as "we covered everything", which is worse than a visible
  // failure: nobody investigates good news.
  //
  // The cap stays (each row carries a full article body; lifting it turns one dashboard click
  // into a multi-megabyte read), but the true total is counted separately and the difference
  // is surfaced through `scanned` / `totalArticles`.
  const SCAN_CAP = 1000;
  const totalArticles = await db.article.count();
  const rows = await db.article.findMany({
    select: { id: true, title: true, nextjsMetadata: true },
    take: SCAN_CAP,
  });

  const missingRows = rows.filter((r) => r.nextjsMetadata && !hasHreflang(r.nextjsMetadata));

  return {
    totalArticles,
    scanned: rows.length,
    missing: missingRows.length,
    sample: missingRows.slice(0, 5).map((r) => ({ id: r.id, title: r.title })),
  };
}

export interface HreflangBackfillResult {
  attempted: number;
  successful: number;
  failed: number;
  /** Rows the cap left unread. Above zero = the sweep was partial; run it again. */
  unscanned: number;
}

/**
 * Re-runs the (now-fixed) generator on every article whose stored card has no hreflang.
 * Idempotent: an article that already has it is skipped, so running twice is a no-op.
 * Sequential in small batches — this writes to every article and must not flood the pool.
 */
export async function backfillArticleHreflang(): Promise<HreflangBackfillResult> {
  // Same cap, same rule: it is reported, not hidden. A run that fixed the first thousand and
  // returned `{ attempted, successful, failed }` looked identical to one that fixed the whole
  // library — so Run-All could report a clean sweep while thousands of rows stayed untouched.
  // `unscanned` is what the panel needs to say "there are more; run it again".
  const SCAN_CAP = 1000;
  const totalArticles = await db.article.count();
  const rows = await db.article.findMany({
    select: { id: true, nextjsMetadata: true },
    take: SCAN_CAP,
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

  return { attempted: targets.length, successful, failed, unscanned: Math.max(0, totalArticles - rows.length) };
}
