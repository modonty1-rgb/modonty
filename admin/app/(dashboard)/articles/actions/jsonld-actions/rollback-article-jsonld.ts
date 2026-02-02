"use server";

import { revalidatePath } from "next/cache";
import { rollbackJsonLd } from "@/lib/seo";

export async function rollbackArticleJsonLd(
  articleId: string,
  targetVersion: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await rollbackJsonLd(articleId, targetVersion);

    if (result.success) {
      revalidatePath(`/articles`);
      revalidatePath(`/articles/${articleId}`);
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
