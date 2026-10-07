import { generateBreadcrumbStructuredData } from "@/lib/seo";

export const buildFallbackJsonLd = () =>
  generateBreadcrumbStructuredData([
    { name: "الرئيسية", url: "/" },
    { name: "الفئات", url: "/categories" },
  ]);
