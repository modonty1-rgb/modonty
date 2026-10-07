import type { ValidationIssue } from "./types";

// Map SEOIssue category to ValidationIssue category
export function mapCategory(category: string): ValidationIssue["category"] {
  switch (category) {
    case "meta":
    case "link":
      return "seo";
    case "image":
      return "media";
    case "content":
    case "heading":
      return "content";
    case "structure":
      return "structured-data";
    default:
      return "seo";
  }
}
