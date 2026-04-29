/**
 * Aggregator — orchestrates all health checks in parallel and computes overall score.
 *
 * No DB — pure function. Call from a server component / server action.
 */

import { checkSsl } from "./ssl";
import { checkDns } from "./dns";
import { checkHeaders } from "./headers";
import { checkRobots } from "./robots";
import { checkSitemap } from "./sitemap";
import { checkDomain } from "./domain";
import { checkMeta } from "./meta";
import { checkSchema } from "./schema-check";
import { checkCoreWebVitals, getPagespeedScores, type PagespeedScores } from "./pagespeed";
import type {
  CategoryReport,
  HealthCategory,
  HealthCheckResult,
  OverallHealthReport,
} from "./types";

function categorize(metric: string): HealthCategory {
  if (metric.startsWith("ssl_") || metric.startsWith("hdr_"))
    return "security";
  if (metric.startsWith("dns_") || metric.startsWith("domain_"))
    return "dns";
  if (
    metric.startsWith("robots_") ||
    metric.startsWith("sitemap_") ||
    metric.startsWith("schema_") ||
    metric.startsWith("meta_")
  )
    return "seo";
  if (metric.startsWith("cwv_"))
    return "performance";
  return "performance";
}

function scoreFor(status: HealthCheckResult["status"]): number {
  if (status === "pass") return 1;
  if (status === "warn") return 0.5;
  if (status === "fail") return 0;
  return -1; // skip — exclude from total
}

function gradeFor(score: number): OverallHealthReport["grade"] {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

function buildCategory(
  category: HealthCategory,
  checks: HealthCheckResult[]
): CategoryReport {
  let total = 0;
  let passed = 0;
  let earned = 0;
  for (const c of checks) {
    const s = scoreFor(c.status);
    if (s < 0) continue; // skip
    total++;
    earned += s;
    if (c.status === "pass") passed++;
  }
  const score = total === 0 ? 0 : Math.round((earned / total) * 100);
  return { category, score, passed, total, checks };
}

export interface FullHealthReport extends OverallHealthReport {
  /** Raw Google PageSpeed scores — shown separately, not mixed into the aggregate */
  pagespeed: PagespeedScores;
}

/**
 * Run all health checks for a URL. Returns aggregated report + raw PSI scores.
 */
export async function runHealthCheck(url: string): Promise<FullHealthReport> {
  const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
  const host = new URL(cleanUrl).hostname;

  // Fetch PSI once (used both for raw scores card AND for CWV checks)
  const emptyStrategy = {
    available: false,
    performance: null,
    accessibility: null,
    bestPractices: null,
    seo: null,
    cwv: { lcpMs: null, lcpDisplay: null, clsValue: null, clsDisplay: null, fcpMs: null, fcpDisplay: null },
    error: "fetch failed",
  };
  const psiPromise = getPagespeedScores(cleanUrl).catch((): PagespeedScores => ({
    mobile: emptyStrategy,
    desktop: emptyStrategy,
  }));

  const [ssl, dns, headers, robots, sitemap, domain, meta, schema, pagespeed] =
    await Promise.all([
      checkSsl(host).catch(() => [] as HealthCheckResult[]),
      checkDns(host).catch(() => [] as HealthCheckResult[]),
      checkHeaders(cleanUrl).catch(() => [] as HealthCheckResult[]),
      checkRobots(cleanUrl).catch(() => [] as HealthCheckResult[]),
      checkSitemap(cleanUrl).catch(() => [] as HealthCheckResult[]),
      checkDomain(host).catch(() => [] as HealthCheckResult[]),
      checkMeta(cleanUrl).catch(() => [] as HealthCheckResult[]),
      checkSchema(cleanUrl).catch(() => [] as HealthCheckResult[]),
      psiPromise,
    ]);

  const cwv = await checkCoreWebVitals(cleanUrl, pagespeed).catch(
    () => [] as HealthCheckResult[]
  );

  // Group by category — PSI category scores NOT included (shown separately)
  const allChecks = [
    ...ssl,
    ...dns,
    ...headers,
    ...robots,
    ...sitemap,
    ...domain,
    ...meta,
    ...schema,
    ...cwv,
  ];

  const byCategory = new Map<HealthCategory, HealthCheckResult[]>();
  for (const c of allChecks) {
    const cat = categorize(c.metric);
    const arr = byCategory.get(cat) ?? [];
    arr.push(c);
    byCategory.set(cat, arr);
  }

  const orderedCategories: HealthCategory[] = [
    "security",
    "dns",
    "seo",
    "performance",
    "uptime",
  ];

  const categories: CategoryReport[] = orderedCategories
    .filter((cat) => byCategory.has(cat))
    .map((cat) => buildCategory(cat, byCategory.get(cat) ?? []));

  // Total score = average of category scores (weighted equally)
  const totalScore =
    categories.length === 0
      ? 0
      : Math.round(
          categories.reduce((sum, c) => sum + c.score, 0) / categories.length
        );

  return {
    url: cleanUrl,
    generatedAt: new Date().toISOString(),
    totalScore,
    grade: gradeFor(totalScore),
    categories,
    pagespeed,
  };
}
