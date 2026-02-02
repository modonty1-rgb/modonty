"use server";

import { getCachedJsonLd } from "@/lib/seo";
import type { ValidationReport } from "@/lib/seo/jsonld-validator";

export async function getArticleJsonLd(articleId: string): Promise<{
  jsonLd: object | null;
  validationReport: ValidationReport | null;
}> {
  return getCachedJsonLd(articleId);
}
