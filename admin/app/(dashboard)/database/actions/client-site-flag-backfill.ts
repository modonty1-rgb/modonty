"use server";

import { db } from "@/lib/db";

/**
 * Backfill `Article.isClientSiteArticle` on documents written before the field existed.
 *
 * Why this exists (measured 2026-08-08): the field decides whether an article belongs to
 * a client's own website. Every article written before it was added carries NO such key
 * at all — not `false`, absent — and MongoDB matches an absent field against neither
 * `= false` nor `NOT = true`. The moment the articles list started filtering on it, all
 * 50 rows vanished while the query itself reported no error.
 *
 * Prisma cannot express "key is missing" for a required field (`isSet` exists only on
 * optional ones), so the filter is a raw Mongo command — `$exists: false` is the whole
 * point of this step, and a value comparison would silently match nothing.
 *
 * Idempotent: a second run updates zero documents.
 */

export interface ClientSiteFlagBackfillResult {
  /** Documents that had no `isClientSiteArticle` key before this ran. */
  missing: number;
  /** Documents actually written. */
  filled: number;
}

interface UpdateCommandResult {
  n?: number;
  nModified?: number;
}

export async function getClientSiteFlagBackfillStats(): Promise<{ missing: number }> {
  const result = (await db.$runCommandRaw({
    count: "articles",
    query: { isClientSiteArticle: { $exists: false } },
  })) as { n?: number };

  return { missing: result?.n ?? 0 };
}

export async function backfillClientSiteFlag(): Promise<ClientSiteFlagBackfillResult> {
  const { missing } = await getClientSiteFlagBackfillStats();

  if (missing === 0) return { missing: 0, filled: 0 };

  const result = (await db.$runCommandRaw({
    update: "articles",
    updates: [
      {
        q: { isClientSiteArticle: { $exists: false } },
        u: { $set: { isClientSiteArticle: false } },
        multi: true,
      },
    ],
  })) as UpdateCommandResult;

  return { missing, filled: result?.nModified ?? 0 };
}
