import { db } from "@/lib/db";

import type { GscRow } from "./types";

export type PathType = "article" | "homepage" | "client" | "category" | "tag" | "industry" | "author" | "static" | "other";

export type DbStatus =
  | "PUBLISHED"
  | "DRAFT"
  | "SCHEDULED"
  | "WRITING"
  | "ARCHIVED"
  | "missing"
  | "n/a";

export interface EnrichedPage {
  url: string;
  path: string;
  type: PathType;
  slug?: string;
  dbStatus: DbStatus;
  articleId?: string;
  articleTitle?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface CoverageSummary {
  total: number;
  live: number;
  archived: number;
  missing: number;
  draft: number;
  other: number;
  /** Published articles in DB whose slug isn't present in GSC top pages (no impressions). */
  pendingIndexing: number;
  /** Live = published article. Excludes "other" pages from numerator and denominator. */
  liveCoveragePct: number;
}

/** Article info (slug + id + title) needed to compute pendingIndexing. */
export interface PublishedArticleRef {
  id: string;
  slug: string;
  title: string;
}

/**
 * Parse a GSC URL into its semantic parts.
 * Handles trailing slashes and Arabic-encoded slugs.
 */
export function parseUrl(rawUrl: string): { type: PathType; path: string; slug?: string } {
  let path: string;
  try {
    const u = new URL(rawUrl);
    path = u.pathname;
  } catch {
    path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  }

  // Normalize: remove trailing slash (except root)
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  if (path === "" || path === "/") {
    return { type: "homepage", path: "/" };
  }

  const decode = (s: string): string => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };

  const matchPrefix = (prefix: string): string | null => {
    if (path.startsWith(prefix)) {
      const rest = path.slice(prefix.length);
      // Take only the first segment as the slug (ignore deeper paths like /articles/x/comments)
      const slug = decode(rest.split("/")[0] ?? "");
      return slug || null;
    }
    return null;
  };

  const articleSlug = matchPrefix("/articles/");
  if (articleSlug) return { type: "article", path, slug: articleSlug };

  const clientSlug = matchPrefix("/clients/");
  if (clientSlug) return { type: "client", path, slug: clientSlug };

  const categorySlug = matchPrefix("/categories/");
  if (categorySlug) return { type: "category", path, slug: categorySlug };

  const tagSlug = matchPrefix("/tags/");
  if (tagSlug) return { type: "tag", path, slug: tagSlug };

  const industrySlug = matchPrefix("/industries/");
  if (industrySlug) return { type: "industry", path, slug: industrySlug };

  const authorSlug = matchPrefix("/authors/");
  if (authorSlug) return { type: "author", path, slug: authorSlug };

  // Static pages: /about, /contact, /privacy, /terms, etc.
  if (/^\/(about|contact|privacy|terms|search|trending|saved)$/.test(path)) {
    return { type: "static", path };
  }

  return { type: "other", path };
}

/**
 * Fetch all PUBLISHED articles (slug + id + title) — used for "pending indexing"
 * detection: any published article whose slug isn't in the GSC indexed set.
 */
export async function getAllPublishedArticles(): Promise<PublishedArticleRef[]> {
  const articles = await db.article.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, title: true },
    orderBy: { datePublished: "desc" },
  });
  return articles;
}

/**
 * Match GSC pages with DB articles and produce enriched per-page status + summary.
 * Optional `publishedArticles` enables the "pending indexing" computation.
 * Single batch DB query — performant for any GSC page list size.
 */
export async function analyzeGscCoverage(
  gscPages: GscRow[],
  publishedArticles?: PublishedArticleRef[],
): Promise<{
  pages: EnrichedPage[];
  summary: CoverageSummary;
  pendingIndexing: PublishedArticleRef[];
}> {
  // Parse all URLs first
  const parsed = gscPages.map((p) => ({ row: p, info: parseUrl(p.keys[0] ?? "") }));

  // Collect article slugs that need a DB lookup
  const articleSlugs = parsed
    .filter((p) => p.info.type === "article" && p.info.slug)
    .map((p) => p.info.slug!);

  // Batch fetch matching articles
  let articleMap = new Map<
    string,
    { id: string; slug: string; title: string; status: DbStatus }
  >();
  if (articleSlugs.length > 0) {
    const articles = await db.article.findMany({
      where: { slug: { in: articleSlugs } },
      select: { id: true, slug: true, title: true, status: true },
    });
    articleMap = new Map(
      articles.map((a) => [a.slug, { ...a, status: a.status as DbStatus }]),
    );
  }

  // Build enriched rows
  const pages: EnrichedPage[] = parsed.map(({ row, info }) => {
    const base: EnrichedPage = {
      url: row.keys[0] ?? "",
      path: info.path,
      type: info.type,
      slug: info.slug,
      dbStatus: "n/a",
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    };

    if (info.type === "homepage") {
      base.dbStatus = "PUBLISHED";
      return base;
    }

    if (info.type === "article" && info.slug) {
      const article = articleMap.get(info.slug);
      if (article) {
        base.articleId = article.id;
        base.articleTitle = article.title;
        base.dbStatus = article.status;
      } else {
        base.dbStatus = "missing";
      }
      return base;
    }

    return base;
  });

  // Compute pending indexing (DB published \ GSC indexed slugs)
  const indexedSlugs = new Set(
    parsed
      .filter((p) => p.info.type === "article" && p.info.slug)
      .map((p) => p.info.slug!),
  );
  const pendingIndexing: PublishedArticleRef[] = (publishedArticles ?? []).filter(
    (a) => !indexedSlugs.has(a.slug),
  );

  // Build summary
  const summary: CoverageSummary = {
    total: pages.length,
    live: pages.filter((p) => p.dbStatus === "PUBLISHED").length,
    archived: pages.filter((p) => p.dbStatus === "ARCHIVED").length,
    missing: pages.filter((p) => p.dbStatus === "missing").length,
    draft: pages.filter((p) => ["DRAFT", "SCHEDULED", "WRITING"].includes(p.dbStatus)).length,
    other: pages.filter((p) => p.dbStatus === "n/a").length,
    pendingIndexing: pendingIndexing.length,
    liveCoveragePct: 0,
  };

  const denom = summary.total - summary.other;
  summary.liveCoveragePct = denom > 0 ? Math.round((summary.live / denom) * 100) : 100;

  return { pages, summary, pendingIndexing };
}
