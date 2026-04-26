"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateArticle, type ValidationResult } from "@/lib/seo/article-validator";
import { fetchAndParseSitemap } from "@/lib/gsc/parse-sitemap";
import { fetchPageSpeed, type PageSpeedReport } from "@/lib/seo/pagespeed";
import { fetchCruxReport, type CruxReport } from "@/lib/seo/crux";
import { regenerateJsonLd } from "@/lib/seo/jsonld-storage";
import { validateJsonLdComplete, type ValidationReport } from "@/lib/seo/jsonld-validator";
import { SITE_BASE_URL } from "@/lib/gsc/client";
import {
  inspectWithCache,
  refreshInspection,
  type InspectionRecord,
} from "@/lib/gsc/inspection-cache";
import { requestIndexing } from "@/lib/gsc/indexing";
import { revalidatePath, revalidateTag } from "next/cache";

interface PipelineRunResponse {
  ok: boolean;
  error?: string;
  validation?: ValidationResult;
}

interface PageSpeedResponse {
  ok: boolean;
  error?: string;
  report?: PageSpeedReport;
  crux?: CruxReport | null;
  cruxError?: string;
}

interface FinalCheckResponse {
  ok: boolean;
  error?: string;
  inspection?: InspectionRecord;
}

interface IndexingResponse {
  ok: boolean;
  error?: string;
}

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

/** Run stages 1-7, 11 — HTML-based + sitemap inclusion. */
export async function runHtmlPipelineStagesAction(
  articleId: string,
): Promise<PipelineRunResponse> {
  try {
    await requireAuth();
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { id: true, slug: true, title: true, status: true },
    });
    if (!article) return { ok: false, error: "Article not found" };
    if (article.status !== "PUBLISHED") {
      return { ok: false, error: "Article must be PUBLISHED before running pipeline" };
    }

    const url = `${SITE_BASE_URL}/articles/${article.slug}`;

    // Fetch sitemap entries in parallel for the inclusion check
    const sitemap = await fetchAndParseSitemap(`${SITE_BASE_URL}/sitemap.xml`).catch(() => null);
    const sitemapEntries = sitemap?.entries.map((e) => e.loc) ?? [];

    const validation = await validateArticle(
      {
        id: article.id,
        slug: article.slug,
        title: article.title,
        url,
      },
      { sitemapEntries },
    );
    return { ok: true, validation };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Pipeline run failed",
    };
  }
}

/**
 * Run stage 12 — PageSpeed (Lab) + CrUX (Field) in parallel.
 * - PSI Lab: simulated diagnostics (single run, ~10-15% variance).
 * - CrUX Field: real-user p75 metrics, 28-day rolling — what Google ranks on.
 */
export async function runPageSpeedStageAction(
  articleId: string,
): Promise<PageSpeedResponse> {
  try {
    await requireAuth();
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { slug: true },
    });
    if (!article) return { ok: false, error: "Article not found" };

    const url = `${SITE_BASE_URL}/articles/${article.slug}`;

    const [psiResult, cruxResult] = await Promise.allSettled([
      fetchPageSpeed(url, "mobile"),
      fetchCruxReport(url, "PHONE"),
    ]);

    if (psiResult.status === "rejected") {
      return {
        ok: false,
        error: psiResult.reason instanceof Error ? psiResult.reason.message : "PageSpeed check failed",
      };
    }

    return {
      ok: true,
      report: psiResult.value,
      crux: cruxResult.status === "fulfilled" ? cruxResult.value : null,
      cruxError:
        cruxResult.status === "rejected"
          ? cruxResult.reason instanceof Error
            ? cruxResult.reason.message
            : "CrUX fetch failed"
          : undefined,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "PageSpeed check failed",
    };
  }
}

/** Run stage 13 — Final Index Check via GSC URL Inspection. */
export async function runFinalIndexCheckAction(
  articleId: string,
  options: { forceRefresh?: boolean } = {},
): Promise<FinalCheckResponse> {
  try {
    await requireAuth();
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { slug: true },
    });
    if (!article) return { ok: false, error: "Article not found" };

    const url = `${SITE_BASE_URL}/articles/${article.slug}`;
    const inspection = options.forceRefresh
      ? await refreshInspection(url)
      : await inspectWithCache(url);
    revalidateTag("gsc-dashboard", "max");
    return { ok: true, inspection };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Final check failed",
    };
  }
}

interface SchemaValidationResponse {
  ok: boolean;
  error?: string;
  report?: ValidationReport;
  jsonLd?: object;
  source?: "cache" | "fresh";
}

/**
 * Read-only — fetch the article's JSON-LD and validate it against schema.org
 * (via @adobe/structured-data-validator) + AJV + custom rules.
 * Reads cached jsonLdStructuredData if present; does NOT modify the DB.
 */
export async function getSchemaValidationReportAction(
  articleId: string,
): Promise<SchemaValidationResponse> {
  try {
    await requireAuth();
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { id: true, jsonLdStructuredData: true },
    });
    if (!article) return { ok: false, error: "Article not found" };
    if (!article.jsonLdStructuredData) {
      return {
        ok: false,
        error: "No cached JSON-LD found for this article. Click Auto-fix schema first to generate it.",
      };
    }
    let jsonLd: object;
    try {
      jsonLd = JSON.parse(article.jsonLdStructuredData);
    } catch (e) {
      return {
        ok: false,
        error: `Cached JSON-LD is malformed: ${e instanceof Error ? e.message : "parse error"}`,
      };
    }
    const report = await validateJsonLdComplete(jsonLd);
    return { ok: true, report, jsonLd, source: "cache" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Validation failed",
    };
  }
}

/** Auto-fix Stage 7 (Schema) — regenerate Article JSON-LD cache from current article data. */
export async function autoFixSchemaAction(
  articleId: string,
): Promise<{ ok: boolean; error?: string; details?: string }> {
  try {
    await requireAuth();
    const result = await regenerateJsonLd(articleId);
    if (!result.success) {
      return {
        ok: false,
        error: result.error ?? "JSON-LD regeneration failed",
      };
    }
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { slug: true },
    });
    if (article) {
      revalidatePath(`/articles/${article.slug}`);
    }
    revalidateTag("gsc-dashboard", "max");
    const errorCount = result.validationReport?.adobe?.errors?.length ?? 0;
    const warningCount = result.validationReport?.adobe?.warnings?.length ?? 0;
    return {
      ok: true,
      details: `JSON-LD regenerated and cached. ${errorCount} errors · ${warningCount} warnings in validation report.`,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Auto-fix failed",
    };
  }
}

/** Stage 14 — fire URL_UPDATED to Google Indexing API. */
export async function requestArticleIndexingAction(
  articleId: string,
): Promise<IndexingResponse> {
  try {
    await requireAuth();
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { slug: true },
    });
    if (!article) return { ok: false, error: "Article not found" };

    const url = `${SITE_BASE_URL}/articles/${article.slug}`;
    const result = await requestIndexing(url);
    if (result.success) {
      revalidateTag("gsc-dashboard", "max");
      return { ok: true };
    }
    return { ok: false, error: result.error ?? "Indexing API rejected the request" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Indexing request failed",
    };
  }
}
