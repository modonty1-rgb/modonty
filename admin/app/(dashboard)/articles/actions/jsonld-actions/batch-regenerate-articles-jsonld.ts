"use server";

import { revalidatePath } from "next/cache";
import { batchRegenerateJsonLd } from "@/lib/seo";

export async function batchRegenerateArticlesJsonLd(
  articleIds: string[]
): Promise<{
  successful: number;
  failed: number;
  errors: Array<{ articleId: string; error: string }>;
}> {
  try {
    const result = await batchRegenerateJsonLd(articleIds);

    revalidatePath("/articles");

    return {
      successful: result.successful,
      failed: result.failed,
      errors: result.results
        .filter((r) => !r.success && r.error)
        .map((r) => ({ articleId: r.articleId, error: r.error! })),
    };
  } catch (error) {
    return {
      successful: 0,
      failed: articleIds.length,
      errors: [
        {
          articleId: "all",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ],
    };
  }
}
