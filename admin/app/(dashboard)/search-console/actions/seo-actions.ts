"use server";

import { revalidateTag } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  notifyDeleted,
  requestIndexing,
  notifyDeletedBatch,
  requestIndexingBatch,
  type IndexingResult,
} from "@/lib/gsc/indexing";
import { bulkInspect } from "@/lib/gsc/inspection-cache";
import { SITE_BASE_URL } from "@/lib/gsc/client";

interface ActionResponse {
  ok: boolean;
  result?: IndexingResult;
  results?: IndexingResult[];
  error?: string;
}

interface BulkInspectionResponse {
  ok: boolean;
  inspectedCount?: number;
  errorCount?: number;
  errors?: { url: string; message: string }[];
  error?: string;
}

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function notifyGoogleDeletedAction(url: string): Promise<ActionResponse> {
  try {
    await requireAuth();
    const result = await notifyDeleted(url);
    if (result.success) revalidateTag("gsc-dashboard", "max");
    return { ok: result.success, result, error: result.error };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to notify Google" };
  }
}

export async function requestIndexingAction(url: string): Promise<ActionResponse> {
  try {
    await requireAuth();
    const result = await requestIndexing(url);
    if (result.success) revalidateTag("gsc-dashboard", "max");
    return { ok: result.success, result, error: result.error };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to request indexing" };
  }
}

export async function notifyGoogleDeletedBulkAction(urls: string[]): Promise<ActionResponse> {
  try {
    await requireAuth();
    if (urls.length === 0) return { ok: true, results: [] };
    if (urls.length > 50) return { ok: false, error: "Too many URLs (max 50 per batch)" };
    const results = await notifyDeletedBatch(urls);
    revalidateTag("gsc-dashboard", "max");
    return { ok: true, results };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Bulk notification failed" };
  }
}

export async function requestIndexingBulkAction(urls: string[]): Promise<ActionResponse> {
  try {
    await requireAuth();
    if (urls.length === 0) return { ok: true, results: [] };
    if (urls.length > 50) return { ok: false, error: "Too many URLs (max 50 per batch)" };
    const results = await requestIndexingBatch(urls);
    revalidateTag("gsc-dashboard", "max");
    return { ok: true, results };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Bulk indexing failed" };
  }
}

/** Bulk inspect — defaults to all PUBLISHED articles when no urls passed. */
export async function bulkInspectAction(
  options: { urls?: string[]; forceRefresh?: boolean } = {},
): Promise<BulkInspectionResponse> {
  try {
    await requireAuth();
    let urls = options.urls;
    if (!urls || urls.length === 0) {
      const articles = await db.article.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true },
      });
      urls = articles.map((a) => `${SITE_BASE_URL}/articles/${a.slug}`);
    }
    if (urls.length === 0) return { ok: true, inspectedCount: 0, errorCount: 0, errors: [] };
    if (urls.length > 200) {
      return { ok: false, error: "Too many URLs (max 200 per bulk run — respect 2K/day quota)" };
    }
    const { results, errors } = await bulkInspect(urls, {
      forceRefresh: options.forceRefresh,
      concurrency: 3,
    });
    revalidateTag("gsc-dashboard", "max");
    return {
      ok: true,
      inspectedCount: results.length,
      errorCount: errors.length,
      errors: errors.slice(0, 10),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Bulk inspection failed" };
  }
}
