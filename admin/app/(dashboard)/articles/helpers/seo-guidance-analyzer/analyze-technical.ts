import type { ArticleFormData } from "@/lib/types/form-types";
import type { ChecklistItem } from "./types";

export function analyzeTechnical(formData: ArticleFormData): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  if (!formData.canonicalUrl) {
    items.push({
      id: "canonical-missing",
      category: "technical",
      label: "Canonical URL",
      status: "warning",
      recommendation:
        "Canonical URL will be auto-generated from slug (recommended for duplicate content prevention)",
      field: "canonicalUrl",
      priority: "high",
      officialSource:
        "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
    });
  } else {
    const isHttps = formData.canonicalUrl.startsWith("https://");
    if (!isHttps) {
      items.push({
        id: "canonical-not-https",
        category: "technical",
        label: "Canonical URL (HTTPS)",
        status: "warning",
        currentValue: "HTTP",
        targetValue: "HTTPS",
        recommendation: "Use HTTPS for canonical URL (required by Google)",
        field: "canonicalUrl",
        priority: "high",
        officialSource: "https://developers.google.com/search/docs/essentials",
      });
    } else {
      items.push({
        id: "canonical-ok",
        category: "technical",
        label: "Canonical URL",
        status: "pass",
        recommendation: "Canonical URL is set and uses HTTPS",
        field: "canonicalUrl",
        priority: "high",
      });
    }
  }

  if (formData.sitemapPriority !== undefined) {
    items.push({
      id: "sitemap-priority-set",
      category: "technical",
      label: "Sitemap Priority",
      status: "pass",
      currentValue: formData.sitemapPriority,
      recommendation: "Sitemap priority is configured",
      field: "sitemapPriority",
      priority: "low",
    });
  }

  if (formData.sitemapChangeFreq) {
    items.push({
      id: "sitemap-changefreq-set",
      category: "technical",
      label: "Sitemap Change Frequency",
      status: "pass",
      currentValue: formData.sitemapChangeFreq,
      recommendation: "Sitemap change frequency is configured",
      field: "sitemapChangeFreq",
      priority: "low",
    });
  }

  return items;
}

