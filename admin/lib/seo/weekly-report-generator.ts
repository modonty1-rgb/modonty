/**
 * Weekly Report Generator - Phase 14
 *
 * Automated weekly SEO reports with validation statistics, error trends, and recommendations.
 */

import { db } from "@/lib/db";
import { getJsonLdStats } from "./jsonld-storage";
import type { ErrorTrend } from "./search-console-api";
import { sendAlert, getAlertConfig, type Alert } from "./alert-system";

export interface WeeklyReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalArticles: number;
    articlesWithErrors: number;
    articlesWithWarnings: number;
    validationRate: number;
    jsonLdCoverage: number;
  };
  topIssues: Array<{
    issue: string;
    count: number;
    severity: "error" | "warning" | "info";
  }>;
  errorTrends: ErrorTrend[];
  improvements: string[];
  actionItems: string[];
}

/**
 * Generate weekly SEO report
 */
export async function generateWeeklyReport(
  weekStartDate?: Date
): Promise<WeeklyReport> {
  // A closed week that has actually happened. Before this the no-argument case ran
  // [now-7d … now+7d] — half the window in the future — and the argument case handed
  // `startDate` the caller's own Date object and then mutated it.
  const now = new Date();
  const startDate = new Date(weekStartDate ?? now);
  if (!weekStartDate) {
    startDate.setDate(startDate.getDate() - 7);
  }
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  if (endDate > now) {
    endDate.setTime(now.getTime());
  }

  // Fetch all published articles
  const articles = await db.article.findMany({
    where: {
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      jsonLdValidationReport: true,
      jsonLdStructuredData: true,
      dateModified: true,
    },
  });

  const totalArticles = articles.length;
  let articlesWithErrors = 0;
  let articlesWithWarnings = 0;
  const issueCount: Record<string, number> = {};
  let withJsonLd = 0;

  // Analyze articles
  for (const article of articles) {
    if (article.jsonLdStructuredData) {
      withJsonLd++;
    }


    const report = article.jsonLdValidationReport as any;
    if (report?.adobe?.errors && report.adobe.errors.length > 0) {
      articlesWithErrors++;
      for (const error of report.adobe.errors) {
        const msg = error.message || "Unknown error";
        issueCount[msg] = (issueCount[msg] || 0) + 1;
      }
    }
    if (report?.adobe?.warnings && report.adobe.warnings.length > 0) {
      articlesWithWarnings++;
    }
    if (report?.custom?.errors && report.custom.errors.length > 0) {
      articlesWithErrors++;
      for (const error of report.custom.errors) {
        const msg = String(error);
        issueCount[msg] = (issueCount[msg] || 0) + 1;
      }
    }
    if (report?.custom?.warnings && report.custom.warnings.length > 0) {
      articlesWithWarnings++;
    }
  }

  // Get top issues
  const topIssues = Object.entries(issueCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([issue, count]) => ({
      issue,
      count,
      severity: issue.toLowerCase().includes("error") ||
        issue.toLowerCase().includes("missing")
        ? ("error" as const)
        : ("warning" as const),
    }));

  // Calculate metrics
  const validationRate =
    totalArticles > 0
      ? Math.round(
          ((totalArticles - articlesWithErrors) / totalArticles) * 100
        )
      : 0;

  const jsonLdCoverage =
    totalArticles > 0
      ? Math.round((withJsonLd / totalArticles) * 100)
      : 0;

  // Get JSON-LD stats
  const jsonLdStats = await getJsonLdStats();

  // Current structured-data errors grouped by type (a snapshot, not a window — Search
  // Console serves no history for rich-results issues). Empty here means either "Google
  // reported none" or "we could not read Search Console"; `generateReportSummary` says so.
  let errorTrends: ErrorTrend[] = [];
  try {
    const {
      getSearchConsoleCredentials,
      initSearchConsoleClient,
      fetchErrorTrends,
    } = await import("./search-console-api");
    const credentials = getSearchConsoleCredentials();
    if (credentials) {
      const auth = await initSearchConsoleClient(credentials);
      if (auth) {
        errorTrends = await fetchErrorTrends(credentials.siteUrl, auth);
      }
    }
  } catch (error) {
    console.error("Failed to fetch error trends:", error);
  }

  // Generate improvements and action items
  const improvements = generateImprovements(
    topIssues,
    validationRate,
    jsonLdCoverage
  );
  const actionItems = generateActionItems(
    articlesWithErrors,
    articlesWithWarnings,
    topIssues
  );

  return {
    period: {
      start: startDate,
      end: endDate,
    },
    summary: {
      totalArticles,
      articlesWithErrors,
      articlesWithWarnings,
      validationRate,
      jsonLdCoverage,
    },
    topIssues,
    errorTrends,
    improvements,
    actionItems,
  };
}

/**
 * Generate improvement suggestions
 */
function generateImprovements(
  topIssues: WeeklyReport["topIssues"],
  validationRate: number,
  jsonLdCoverage: number
): string[] {
  const improvements: string[] = [];

  if (validationRate < 95) {
    improvements.push(
      `Improve validation rate from ${validationRate}% to 95%+ by fixing schema errors`
    );
  }

  if (jsonLdCoverage < 100) {
    improvements.push(
      `Increase JSON-LD coverage from ${jsonLdCoverage}% to 100% by generating structured data for all articles`
    );
  }

  for (const issue of topIssues.slice(0, 3)) {
    if (issue.severity === "error") {
      improvements.push(
        `Fix "${issue.issue}" affecting ${issue.count} article(s)`
      );
    }
  }

  return improvements;
}

/**
 * Generate action items
 */
function generateActionItems(
  errors: number,
  warnings: number,
  topIssues: WeeklyReport["topIssues"]
): string[] {
  const items: string[] = [];

  if (errors > 0) {
    items.push(
      `Fix ${errors} article(s) with validation errors (blocking issues)`
    );
  }

  if (warnings > 10) {
    items.push(
      `Review ${warnings} article(s) with warnings (quality issues)`
    );
  }

  for (const issue of topIssues.slice(0, 3)) {
    if (issue.count >= 3) {
      items.push(
        `Address "${issue.issue}" affecting ${issue.count} article(s)`
      );
    }
  }

  return items;
}

/**
 * Send weekly report via configured alert channels
 */
export async function sendWeeklyReport(
  report: WeeklyReport,
  config = getAlertConfig()
): Promise<void> {
  const alert: Alert = {
    type: report.summary.articlesWithErrors > 0 ? "error" : "warning",
    title: "Weekly SEO Report",
    message: generateReportSummary(report),
    timestamp: new Date(),
    severity:
      report.summary.articlesWithErrors > 10
        ? "high"
        : report.summary.articlesWithErrors > 0
          ? "medium"
          : "low",
    metadata: {
      totalArticles: report.summary.totalArticles,
      validationRate: report.summary.validationRate,
      articlesWithErrors: report.summary.articlesWithErrors,
      articlesWithWarnings: report.summary.articlesWithWarnings,
      jsonLdCoverage: report.summary.jsonLdCoverage,
    },
  };

  await sendAlert(alert, config);
}

/**
 * Generate report summary text
 */
function generateReportSummary(report: WeeklyReport): string {
  const lines: string[] = [];

  // Nothing in this report is scoped to the week: the article query carries no date
  // filter, and Search Console serves no history for rich-results issues. The dates below
  // are the report RUN window, so label them as such rather than implying the numbers
  // were measured over them.
  lines.push(`📊 SEO Report — generated for the week of ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()} (all figures are a snapshot taken now, not a weekly delta)`);
  lines.push("");
  lines.push(`📝 Total Articles (all published, not only this week): ${report.summary.totalArticles}`);
  lines.push(`✅ Validation Rate: ${report.summary.validationRate}%`);
  lines.push(`📈 JSON-LD Coverage: ${report.summary.jsonLdCoverage}%`);
  lines.push(`❌ Articles with Errors: ${report.summary.articlesWithErrors}`);
  lines.push(`⚠️ Articles with Warnings: ${report.summary.articlesWithWarnings}`);
  if (report.topIssues.length > 0) {
    lines.push("");
    lines.push("🔴 Top Issues:");
    for (const issue of report.topIssues.slice(0, 5)) {
      lines.push(`  • ${issue.issue} (${issue.count} articles)`);
    }
  }

  if (report.actionItems.length > 0) {
    lines.push("");
    lines.push("📋 Action Items:");
    for (const item of report.actionItems) {
      lines.push(`  • ${item}`);
    }
  }

  return lines.join("\n");
}

/**
 * Schedule weekly report generation
 */
export async function scheduleWeeklyReport(): Promise<void> {
  try {
    const report = await generateWeeklyReport();
    const config = getAlertConfig();
    await sendWeeklyReport(report, config);
  } catch (error) {
    console.error("Failed to generate weekly report:", error);
  }
}