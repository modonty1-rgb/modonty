"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { createHeadChecker } from "@/lib/seo/head-check";
import {
  ARTICLE_HEALTH_SELECT,
  checkArticleHealth,
  type HealthArticle,
} from "@/lib/health/article-health";
import type { HealthIssue } from "@/lib/health/article-health-types";

/**
 * Runs the article health sweep one batch at a time.
 *
 * Batched rather than one long call for three reasons: the caller can render honest
 * progress, Khalid can stop mid-run, and no single invocation approaches the function
 * timeout. Batch size is deliberately larger than the usual 5 used by DB maintenance —
 * the run cache lives inside ONE call, so a bigger batch means the publisher logo shared
 * by twenty articles is fetched once instead of four times.
 *
 * Scope is EVERY status (Khalid 2026-08-04): finding a dead cover while the article is
 * still a draft beats chasing it after publication. `public-url` is the one check that
 * stays status-aware — see `expectedPublicStatus`.
 */

const DEFAULT_BATCH = 20;
const MAX_BATCH = 50;
const CONCURRENCY = 10;

export interface HealthBatchResult {
  ok: true;
  issues: HealthIssue[];
  /** Articles examined by this batch. */
  scanned: number;
  /** Articles examined since the start of the sweep, including this batch. */
  cursor: number;
  total: number;
  done: boolean;
  /** URLs actually fetched by this batch — duplicates served from cache are excluded. */
  requests: number;
}

export type HealthBatchResponse = HealthBatchResult | { ok: false; error: string };

export async function runArticleHealthBatch(input: {
  skip: number;
  take?: number;
}): Promise<HealthBatchResponse> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };

  const skip = Math.max(0, Math.floor(input.skip));
  const take = Math.min(MAX_BATCH, Math.max(1, Math.floor(input.take ?? DEFAULT_BATCH)));

  try {
    const [total, rows, siteUrl] = await Promise.all([
      db.article.count(),
      db.article.findMany({
        skip,
        take,
        // Stable order so batches never overlap or skip a row mid-sweep.
        orderBy: { id: "asc" },
        select: ARTICLE_HEALTH_SELECT,
      }),
      loadSiteUrl(),
    ]);

    const head = createHeadChecker({ concurrency: CONCURRENCY });
    const issues: HealthIssue[] = [];

    for (const row of rows) {
      issues.push(...(await checkArticleHealth(row as HealthArticle, { head, siteUrl })));
    }

    const cursor = skip + rows.length;
    return {
      ok: true,
      issues,
      scanned: rows.length,
      cursor,
      total,
      done: cursor >= total || rows.length === 0,
      requests: head.fetched(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, error: `فشل الفحص: ${message}` };
  }
}
