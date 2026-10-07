"use server";

import { db } from "@/lib/db";
import { regenerateNextjsMetadata } from "@/lib/seo/metadata-storage";

interface MetaShape {
  alternates?: { languages?: Record<string, string> | null } | null;
}

const hasHreflang = (meta: unknown): boolean => {
  const langs = (meta as MetaShape | null)?.alternates?.languages;
  return Boolean(langs && typeof langs === "object" && Object.keys(langs).length > 0);
};

interface HreflangBackfillResult {
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
