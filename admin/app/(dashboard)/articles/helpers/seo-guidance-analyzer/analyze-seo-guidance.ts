import type { ArticleFormData } from "@/lib/types/form-types";
import type { SEOGuidanceResult } from "./types";
import { analyzeMetaTags } from "./analyze-meta-tags";
import { analyzeContentQuality } from "./analyze-content-quality";
import { analyzeImages } from "./analyze-images";
import { analyzeStructuredData } from "./analyze-structured-data";
import { analyzeTechnical } from "./analyze-technical";
import { analyzeMobile } from "./analyze-mobile";
import { generateOffPageGuidance } from "./generate-off-page-guidance";
import { calculateCategoryScore } from "./calculate-category-score";

export async function analyzeSEOGuidance(
  formData: ArticleFormData,
  options?: { validateStructuredData?: boolean },
): Promise<SEOGuidanceResult> {
  const metaTags = analyzeMetaTags(formData);
  const content = analyzeContentQuality(formData);
  const images = analyzeImages(formData);
  const structuredData = analyzeStructuredData(formData);
  const technical = analyzeTechnical(formData);
  const mobile = analyzeMobile(formData);

  if (options?.validateStructuredData && formData.jsonLdStructuredData) {
    // reserved for future external validation
  }

  const inPageChecklist = [...metaTags, ...content, ...images, ...structuredData, ...technical, ...mobile];

  const offPageGuidance = generateOffPageGuidance(formData);

  const categories = {
    metaTags: calculateCategoryScore(metaTags, 20),
    content: calculateCategoryScore(content, 25),
    images: calculateCategoryScore(images, 15),
    structuredData: calculateCategoryScore(structuredData, 20),
    technical: calculateCategoryScore(technical, 15),
    mobile: calculateCategoryScore(mobile, 5),
  };

  const totalMaxScore = 100;
  const totalScore = Object.values(categories).reduce((sum, cat) => sum + cat.score, 0);
  const overallScore = Math.round((totalScore / totalMaxScore) * 100);

  const criticalIssues = inPageChecklist
    .filter((item) => item.status === "fail" && item.priority === "critical")
    .map((item) => ({
      code: item.id,
      category: item.category,
      message: item.recommendation,
      fix: item.recommendation,
      field: item.field,
      severity: "critical" as const,
    }));

  const warnings = inPageChecklist.filter((item) => item.status === "warning").map((item) => ({
    code: item.id,
    category: item.category,
    message: item.recommendation,
    fix: item.recommendation,
    field: item.field,
    severity: "warning" as const,
  }));

  const suggestions = inPageChecklist.filter((item) => item.status === "info").map((item) => ({
    code: item.id,
    category: item.category,
    message: item.recommendation,
    fix: item.recommendation,
    field: item.field,
    severity: "suggestion" as const,
  }));

  return {
    overallScore,
    categories,
    inPageChecklist,
    offPageGuidance,
    criticalIssues,
    warnings,
    suggestions,
    lastUpdated: new Date().toISOString(),
  };
}

