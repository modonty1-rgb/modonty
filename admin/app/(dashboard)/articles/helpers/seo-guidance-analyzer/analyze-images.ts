import type { ArticleFormData } from "@/lib/types/form-types";
import type { ChecklistItem } from "./types";

export function analyzeImages(formData: ArticleFormData): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  if (!formData.featuredImageId) {
    items.push({
      id: "featured-image-missing",
      category: "images",
      label: "Featured Image",
      status: "fail",
      recommendation: "Add featured image (1200x630px minimum) for better social sharing and SEO",
      field: "featuredImageId",
      priority: "critical",
      officialSource: "https://developers.google.com/search/docs/appearance/google-images",
    });
  } else {
    items.push({
      id: "featured-image-present",
      category: "images",
      label: "Featured Image",
      status: "pass",
      recommendation: "Featured image is set",
      field: "featuredImageId",
      priority: "high",
    });
  }

  return items;
}

