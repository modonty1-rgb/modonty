"use server";

import { revalidateTag } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bulkInspect } from "@/lib/gsc/inspection-cache";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { buildArticleUrlFromBase } from "@/lib/seo/url-builders";

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
      const siteUrl = await loadSiteUrl();
      urls = articles.map((a) => buildArticleUrlFromBase(a.slug, siteUrl));
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
