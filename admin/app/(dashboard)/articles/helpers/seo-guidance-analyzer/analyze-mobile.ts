import type { ArticleFormData } from "@/lib/types/form-types";
import type { ChecklistItem } from "./types";

export function analyzeMobile(formData: ArticleFormData): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  items.push({
    id: "mobile-friendly",
    category: "mobile",
    label: "Mobile-Friendly",
    status: "info",
    recommendation: "Mobile-friendly design is handled by Next.js responsive framework",
    priority: "low",
    officialSource: "https://developers.google.com/search/docs/essentials/mobile-friendly",
  });

  items.push({
    id: "core-web-vitals",
    category: "mobile",
    label: "Core Web Vitals",
    status: "info",
    recommendation: "Target: LCP < 2.5s, INP < 200ms, CLS < 0.1 (test with PageSpeed Insights)",
    priority: "medium",
    officialSource: "https://web.dev/vitals/",
  });

  return items;
}

