import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeStructuredData(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 20;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  // JSON-LD structured data — critical for rich results
  const hasSavedJsonLd =
    typeof data.jsonLdStructuredData === "string" &&
    data.jsonLdStructuredData.length > 0;
  const hasCoreFieldsForJsonLd =
    !!data.title && !!data.canonicalUrl && !!data.seoDescription;

  if (hasSavedJsonLd || hasCoreFieldsForJsonLd) {
    score += 7;
    checks.push({
      passed: true,
      label: "JSON-LD structured data",
      reason: hasSavedJsonLd ? "Generated" : "Ready (will generate on save)",
    });
  } else {
    checks.push({
      passed: false,
      label: "JSON-LD structured data",
      reason: "Fill title, description, and canonical to generate",
    });
  }

  // Core schema fields — Google Article schema requirements
  let schemaScore = 0;
  const missing: string[] = [];
  if (data.title && data.title.length > 0) { schemaScore += 2; } else { missing.push("title"); }
  if (data.authorId) { schemaScore += 2; } else { missing.push("author"); }
  if (data.datePublished) { schemaScore += 3; } else { missing.push("publish date"); }
  if (data.canonicalUrl) { schemaScore += 3; } else { missing.push("canonical URL"); }
  if (data.seoDescription && data.seoDescription.length > 0) { schemaScore += 3; } else { missing.push("SEO description"); }

  score += schemaScore;
  const schemaOk = schemaScore >= 10;
  checks.push({
    passed: schemaOk,
    label: "Core schema fields",
    reason: schemaOk ? "All required fields present" : `Missing: ${missing.join(", ")}`,
  });

  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;

  return {
    score: Math.round(score),
    maxScore,
    percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
    passed,
    total,
    items: checks,
  };
}
