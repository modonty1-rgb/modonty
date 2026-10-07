import { generateBreadcrumbStructuredData } from "@/lib/seo";

export const buildFallbackJsonLd = () =>
  generateBreadcrumbStructuredData([
    { name: "الرئيسية", url: "/" },
    { name: "المجالات", url: "/industries" },
  ]);
