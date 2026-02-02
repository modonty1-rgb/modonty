import type { ArticleFormData } from "@/lib/types/form-types";
import type { ChecklistItem } from "./types";

export function analyzeStructuredData(formData: ArticleFormData): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  if (!formData.jsonLdStructuredData) {
    items.push({
      id: "jsonld-missing",
      category: "structuredData",
      label: "JSON-LD Structured Data",
      status: "warning",
      recommendation:
        "Generate JSON-LD structured data for better search visibility (will be auto-generated on publish)",
      priority: "high",
      officialSource: "https://developers.google.com/search/docs/appearance/structured-data",
    });
  } else {
    items.push({
      id: "jsonld-present",
      category: "structuredData",
      label: "JSON-LD Structured Data",
      status: "pass",
      recommendation: "JSON-LD structured data is present",
      priority: "high",
    });
  }

  const hasHeadline = !!(formData.title || formData.seoTitle);
  const hasAuthor = !!formData.authorId;
  const hasDatePublished = !!formData.datePublished;
  const hasMainEntity = !!formData.mainEntityOfPage || !!formData.canonicalUrl;
  const hasImage = !!formData.featuredImageId;
  const hasDescription = !!(formData.seoDescription || formData.excerpt);

  if (hasHeadline) {
    items.push({
      id: "schema-headline",
      category: "structuredData",
      label: "Schema: Headline",
      status: "pass",
      recommendation: "Article headline (title) is present",
      priority: "high",
      officialSource: "https://schema.org/Article",
    });
  }

  if (hasAuthor) {
    items.push({
      id: "schema-author",
      category: "structuredData",
      label: "Schema: Author",
      status: "pass",
      recommendation: "Article author is set",
      priority: "high",
      officialSource: "https://schema.org/Article",
    });
  }

  if (hasDatePublished) {
    items.push({
      id: "schema-date-published",
      category: "structuredData",
      label: "Schema: Date Published",
      status: "pass",
      recommendation: "Publication date is set",
      priority: "high",
      officialSource: "https://schema.org/Article",
    });
  } else {
    items.push({
      id: "schema-date-published-missing",
      category: "structuredData",
      label: "Schema: Date Published",
      status: "info",
      recommendation: "Publication date will be set automatically when article is published",
      priority: "medium",
      officialSource: "https://schema.org/Article",
    });
  }

  const faqCount = formData.faqs?.length || 0;
  if (faqCount === 0) {
    items.push({
      id: "faq-schema-missing",
      category: "structuredData",
      label: "FAQ Schema",
      status: "info",
      currentValue: 0,
      targetValue: "3+ questions",
      recommendation: "Add 3+ FAQs to enable FAQ rich results in search",
      field: "faqs",
      priority: "medium",
      officialSource: "https://developers.google.com/search/docs/appearance/structured-data/faqpage",
    });
  } else if (faqCount < 3) {
    items.push({
      id: "faq-schema-few",
      category: "structuredData",
      label: "FAQ Schema",
      status: "warning",
      currentValue: faqCount,
      targetValue: "3+ questions",
      recommendation: `Only ${faqCount} FAQ(s). Add more (3+ recommended) for FAQ rich results.`,
      field: "faqs",
      priority: "medium",
      officialSource: "https://developers.google.com/search/docs/appearance/structured-data/faqpage",
    });
  } else {
    items.push({
      id: "faq-schema-optimal",
      category: "structuredData",
      label: "FAQ Schema",
      status: "pass",
      currentValue: faqCount,
      targetValue: "3+ questions",
      recommendation: `FAQ schema is optimal (${faqCount} questions)`,
      field: "faqs",
      priority: "medium",
    });
  }

  return items;
}

