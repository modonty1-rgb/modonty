import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeStructuredData(
  data: NormalizedInput
): ArticleSEOCategory {
  const maxScore = 20;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  const hasSavedJsonLd =
    typeof data.jsonLdStructuredData === "string" &&
    data.jsonLdStructuredData.length > 0;

  // Treat JSON-LD as \"ready from context\" when we have the same core fields
  // that the live JSON-LD preview uses (title + canonical + description).
  // Author/date are validated separately in the \"Core schema fields\" check.
  const hasCoreFieldsForJsonLd =
    !!data.title &&
    !!data.canonicalUrl &&
    !!data.seoDescription;

  if (hasSavedJsonLd || hasCoreFieldsForJsonLd) {
    score += 5;
    checks.push({
      passed: true,
      label: "JSON-LD structured data",
      reason: hasSavedJsonLd
        ? "Generated"
        : "Ready from form context (will generate on save)",
    });
  } else {
    checks.push({
      passed: false,
      label: "JSON-LD structured data",
      reason: "Save article to generate",
    });
  }

  let schemaScore = 0;
  if (data.title && data.title.length > 0) schemaScore += 2;
  if (data.authorId) schemaScore += 2;
  if (data.datePublished) schemaScore += 2;
  if (data.canonicalUrl) schemaScore += 2;
  if (data.seoDescription && data.seoDescription.length > 0)
    schemaScore += 2;

  score += schemaScore;
  const schemaOk = schemaScore >= 8;
  checks.push({
    passed: schemaOk,
    label: "Core schema fields (title, author, date, canonical, description)",
    reason: schemaOk ? "Complete" : `${schemaScore}/10 (need 8+)`,
  });

  if (data.faqCount >= 3) {
    score += 5;
    checks.push({ passed: true, label: "FAQs ≥3", reason: `${data.faqCount} FAQs` });
  } else if (data.faqCount > 0) {
    score += 2;
    checks.push({ passed: false, label: "FAQs ≥3", reason: `${data.faqCount} FAQ(s) (need 3+)` });
  } else {
    checks.push({ passed: false, label: "FAQs ≥3", reason: "None" });
  }

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
