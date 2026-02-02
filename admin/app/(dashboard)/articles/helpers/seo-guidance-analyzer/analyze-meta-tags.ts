import type { ArticleFormData } from "@/lib/types/form-types";
import type { ChecklistItem } from "./types";

export function analyzeMetaTags(formData: ArticleFormData): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const seoTitle = formData.seoTitle || formData.title || "";
  const seoDescription = formData.seoDescription || formData.excerpt || "";

  const titleLength = seoTitle.length;
  if (titleLength === 0) {
    items.push({
      id: "seo-title-missing",
      category: "metaTags",
      label: "SEO Title",
      status: "fail",
      currentValue: 0,
      targetValue: "30-60 characters",
      recommendation: "Add SEO title (30-60 characters optimal, 50-55 best for search results)",
      field: "seoTitle",
      priority: "critical",
      officialSource: "https://developers.google.com/search/docs/appearance/title-link",
    });
  } else if (titleLength < 30) {
    items.push({
      id: "seo-title-short",
      category: "metaTags",
      label: "SEO Title Length",
      status: "warning",
      currentValue: titleLength,
      targetValue: "30-60 characters",
      recommendation: `SEO title is short (${titleLength} chars). Aim for 30-60 characters for optimal display in search results.`,
      field: "seoTitle",
      priority: "high",
      officialSource: "https://developers.google.com/search/docs/appearance/title-link",
    });
  } else if (titleLength > 60) {
    items.push({
      id: "seo-title-long",
      category: "metaTags",
      label: "SEO Title Length",
      status: "warning",
      currentValue: titleLength,
      targetValue: "30-60 characters",
      recommendation: `SEO title is long (${titleLength} chars). Keep it under 60 characters to avoid truncation in search results.`,
      field: "seoTitle",
      priority: "medium",
      officialSource: "https://developers.google.com/search/docs/appearance/title-link",
    });
  } else {
    items.push({
      id: "seo-title-optimal",
      category: "metaTags",
      label: "SEO Title Length",
      status: "pass",
      currentValue: titleLength,
      targetValue: "30-60 characters",
      recommendation: `SEO title length is optimal (${titleLength} chars)`,
      field: "seoTitle",
      priority: "high",
    });
  }

  const descLength = seoDescription.length;
  if (descLength === 0) {
    items.push({
      id: "seo-description-missing",
      category: "metaTags",
      label: "SEO Description",
      status: "fail",
      currentValue: 0,
      targetValue: "120-160 characters",
      recommendation: "Add SEO description (120-160 characters optimal, 150-155 best for search snippets)",
      field: "seoDescription",
      priority: "critical",
      officialSource: "https://developers.google.com/search/docs/appearance/snippet",
    });
  } else if (descLength < 120) {
    items.push({
      id: "seo-description-short",
      category: "metaTags",
      label: "SEO Description Length",
      status: "warning",
      currentValue: descLength,
      targetValue: "120-160 characters",
      recommendation: `SEO description is short (${descLength} chars). Aim for 120-160 characters for optimal display.`,
      field: "seoDescription",
      priority: "high",
      officialSource: "https://developers.google.com/search/docs/appearance/snippet",
    });
  } else if (descLength > 160) {
    items.push({
      id: "seo-description-long",
      category: "metaTags",
      label: "SEO Description Length",
      status: "warning",
      currentValue: descLength,
      targetValue: "120-160 characters",
      recommendation: `SEO description is long (${descLength} chars). Keep it under 160 characters to avoid truncation.`,
      field: "seoDescription",
      priority: "medium",
      officialSource: "https://developers.google.com/search/docs/appearance/snippet",
    });
  } else {
    items.push({
      id: "seo-description-optimal",
      category: "metaTags",
      label: "SEO Description Length",
      status: "pass",
      currentValue: descLength,
      targetValue: "120-160 characters",
      recommendation: `SEO description length is optimal (${descLength} chars)`,
      field: "seoDescription",
      priority: "high",
    });
  }

  const metaRobots = formData.metaRobots || "index, follow";
  if (metaRobots.includes("noindex")) {
    items.push({
      id: "meta-robots-noindex",
      category: "metaTags",
      label: "Meta Robots",
      status: "warning",
      currentValue: metaRobots,
      targetValue: "index, follow",
      recommendation:
        "Article is set to noindex - it will not appear in search results. Use only if intentionally hiding content.",
      field: "metaRobots",
      priority: "high",
      officialSource: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
    });
  } else {
    items.push({
      id: "meta-robots-ok",
      category: "metaTags",
      label: "Meta Robots",
      status: "pass",
      currentValue: metaRobots,
      targetValue: "index, follow",
      recommendation: "Meta robots configured correctly",
      field: "metaRobots",
      priority: "medium",
    });
  }

  return items;
}

