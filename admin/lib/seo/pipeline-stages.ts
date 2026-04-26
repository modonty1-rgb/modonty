import type { CheckSeverity } from "./article-validator";

export type StageKey =
  | "reachability"
  | "indexability"
  | "mobile-friendliness"
  | "document-language"
  | "metadata"
  | "content"
  | "schema"
  | "media"
  | "internal-links"
  | "external-links"
  | "sitemap-inclusion"
  | "performance"
  | "final-check";

export interface StageDefinition {
  id: number;
  key: StageKey;
  name: string;
  description: string;
  /** Validator check IDs that belong to this stage. Empty for placeholder stages. */
  checkIds: string[];
  /** True if the stage is not yet implemented (shows "coming soon"). */
  placeholder: boolean;
  /** True if the stage uses external data (GSC, PageSpeed) instead of HTML parsing. */
  external?: boolean;
}

export const PIPELINE_STAGES: StageDefinition[] = [
  {
    id: 1,
    key: "reachability",
    name: "Reachability",
    description: "HTTP 200 · no redirect · HTTPS",
    checkIds: ["http-status", "no-redirect", "https"],
    placeholder: false,
  },
  {
    id: 2,
    key: "indexability",
    name: "Indexability",
    description: "Is Google allowed to index this page?",
    checkIds: ["no-noindex", "canonical"],
    placeholder: false,
  },
  {
    id: 3,
    key: "mobile-friendliness",
    name: "Mobile-Friendliness",
    description: "Viewport meta tag · zoom enabled",
    checkIds: ["viewport"],
    placeholder: false,
  },
  {
    id: 4,
    key: "document-language",
    name: "Document Language",
    description: "<html lang=\"ar\"> declared correctly",
    checkIds: ["html-lang"],
    placeholder: false,
  },
  {
    id: 5,
    key: "metadata",
    name: "Metadata",
    description: "Title, description, hreflang, OG tags",
    checkIds: ["title", "meta-description", "hreflang", "og-image"],
    placeholder: false,
  },
  {
    id: 6,
    key: "content",
    name: "Content",
    description: "Heading structure and word count",
    checkIds: ["h1", "word-count"],
    placeholder: false,
  },
  {
    id: 7,
    key: "schema",
    name: "Schema",
    description: "JSON-LD structured data for rich results",
    checkIds: ["schema-article", "schema-breadcrumb"],
    placeholder: false,
  },
  {
    id: 8,
    key: "media",
    name: "Media",
    description: "Image alt text · images load (200)",
    checkIds: ["media-alt", "media-images-load"],
    placeholder: false,
  },
  {
    id: 9,
    key: "internal-links",
    name: "Internal Links",
    description: "Internal link count · anchor quality · broken links",
    checkIds: ["internal-links-count", "internal-links-anchors", "internal-links-broken"],
    placeholder: false,
  },
  {
    id: 10,
    key: "external-links",
    name: "External Links",
    description: "External links return 200 · rel=noopener safety",
    checkIds: ["external-links-broken", "external-links-safety"],
    placeholder: false,
  },
  {
    id: 11,
    key: "sitemap-inclusion",
    name: "Sitemap Inclusion",
    description: "URL appears in /sitemap.xml — Google's discovery channel",
    checkIds: ["sitemap-inclusion"],
    placeholder: false,
  },
  {
    id: 12,
    key: "performance",
    name: "Performance (Core Web Vitals)",
    description: "LCP, CLS, INP via PageSpeed Insights",
    checkIds: [],
    placeholder: false,
    external: true,
  },
  {
    id: 13,
    key: "final-check",
    name: "Google's Report",
    description: "Asks Google directly: \"What do you think of this page?\"",
    checkIds: [],
    placeholder: false,
    external: true,
  },
];

export function getStageByKey(key: StageKey): StageDefinition | undefined {
  return PIPELINE_STAGES.find((s) => s.key === key);
}

export interface StageStatusSummary {
  status: "locked" | "ready" | "warnings" | "critical" | "not-run" | "placeholder";
  passed: number;
  failed: number;
  total: number;
  hasCritical: boolean;
}

export function summarizeStage(
  stage: StageDefinition,
  checkResults: Array<{ id: string; passed: boolean; severity: CheckSeverity }> | null,
): StageStatusSummary {
  if (stage.placeholder) {
    return {
      status: "placeholder",
      passed: 0,
      failed: 0,
      total: 0,
      hasCritical: false,
    };
  }
  if (!checkResults) {
    return { status: "not-run", passed: 0, failed: 0, total: stage.checkIds.length, hasCritical: false };
  }
  const stageChecks = checkResults.filter((c) => stage.checkIds.includes(c.id));
  const passed = stageChecks.filter((c) => c.passed).length;
  const failed = stageChecks.filter((c) => !c.passed);
  const hasCritical = failed.some((c) => c.severity === "critical");
  const status: StageStatusSummary["status"] =
    failed.length === 0
      ? "ready"
      : hasCritical
        ? "critical"
        : "warnings";
  return {
    status,
    passed,
    failed: failed.length,
    total: stageChecks.length,
    hasCritical,
  };
}
