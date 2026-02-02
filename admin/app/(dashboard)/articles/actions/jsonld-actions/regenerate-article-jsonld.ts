"use server";

import { revalidatePath } from "next/cache";
import { generateAndSaveJsonLd } from "@/lib/seo";
import type { ValidationReport } from "@/lib/seo/jsonld-validator";

export async function regenerateArticleJsonLd(articleId: string): Promise<{
  success: boolean;
  jsonLd?: object;
  validationReport?: ValidationReport;
  error?: string;
}> {
  try {
    const result = await generateAndSaveJsonLd(articleId);

    if (result.success) {
      revalidatePath(`/articles`);
      revalidatePath(`/articles/${articleId}`);
    }

    return {
      success: result.success,
      jsonLd: result.jsonLd,
      validationReport: result.validationReport,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
