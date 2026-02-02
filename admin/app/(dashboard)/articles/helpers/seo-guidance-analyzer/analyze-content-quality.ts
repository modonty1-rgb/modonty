import type { ArticleFormData } from "@/lib/types/form-types";
import { calculateWordCountImproved } from "../seo-helpers";
import type { ChecklistItem } from "./types";

export function analyzeContentQuality(formData: ArticleFormData): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const content = formData.content || "";
  const wordCount = formData.wordCount || calculateWordCountImproved(content, formData.inLanguage || "ar");

  if (wordCount === 0) {
    items.push({
      id: "content-missing",
      category: "content",
      label: "Content",
      status: "fail",
      currentValue: 0,
      targetValue: "800+ words",
      recommendation: "Add article content (minimum 300 words, 800+ recommended for SEO)",
      field: "content",
      priority: "critical",
      officialSource: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    });
  } else if (wordCount < 300) {
    items.push({
      id: "word-count-very-low",
      category: "content",
      label: "Word Count",
      status: "fail",
      currentValue: wordCount,
      targetValue: "800+ words",
      recommendation: `Content is very short (${wordCount} words). Minimum 300 words recommended, 800+ for better SEO.`,
      field: "content",
      priority: "critical",
      officialSource: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    });
  } else if (wordCount < 800) {
    items.push({
      id: "word-count-low",
      category: "content",
      label: "Word Count",
      status: "warning",
      currentValue: wordCount,
      targetValue: "800+ words",
      recommendation: `Content is short (${wordCount} words). Aim for 800+ words for better SEO performance.`,
      field: "content",
      priority: "high",
      officialSource: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    });
  } else if (wordCount > 3000) {
    items.push({
      id: "word-count-very-high",
      category: "content",
      label: "Word Count",
      status: "info",
      currentValue: wordCount,
      targetValue: "1000-3000 words",
      recommendation: `Content is very long (${wordCount} words). Consider breaking into multiple articles or adding table of contents.`,
      field: "content",
      priority: "low",
    });
  } else {
    items.push({
      id: "word-count-optimal",
      category: "content",
      label: "Word Count",
      status: "pass",
      currentValue: wordCount,
      targetValue: "800+ words",
      recommendation: `Content length is good (${wordCount} words)`,
      field: "content",
      priority: "high",
    });
  }

  if (formData.contentDepth) {
    items.push({
      id: "content-depth-set",
      category: "content",
      label: "Content Depth",
      status: "pass",
      currentValue: formData.contentDepth,
      recommendation: "Content depth indicator is set",
      priority: "low",
    });
  } else {
    items.push({
      id: "content-depth-missing",
      category: "content",
      label: "Content Depth",
      status: "info",
      recommendation: "Content depth indicator helps signal content comprehensiveness",
      priority: "low",
    });
  }

  return items;
}

