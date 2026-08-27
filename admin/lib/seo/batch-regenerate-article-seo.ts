import { generateAndSaveJsonLd } from "./jsonld-storage";
import { generateAndSaveNextjsMetadata } from "./metadata-storage";

/**
 * Rebuild BOTH stored SEO blobs for a set of articles: the JSON-LD graph and the Next.js
 * metadata object.
 *
 * It exists because "regenerate the articles" meant only `batchRegenerateJsonLd`, and half
 * the published surface lives in the other blob. Renaming an author rebuilt the JSON-LD
 * `author.name` and left `openGraph.authors` and `twitter.creator` on the old name; renaming
 * a category rebuilt the graph and left `article:section`. Two names for one entity on one
 * page, and the wrong one is the one the social crawlers read.
 *
 * The regeneration matrix, stated once so no caller has to rediscover it:
 *
 *   author renamed    → every article of that author  → JSON-LD + metadata
 *   category renamed  → every article in that category → JSON-LD + metadata
 *   tag renamed       → every article carrying that tag → JSON-LD + metadata
 *
 * Both generators CATCH internally and return `{ success, error }` — neither ever throws, so
 * `await generateX(id)` always looks like it worked. Their answers are read here, and the
 * caller gets a count it can gate a cache flush on. Publishing a flush after a failed rebuild
 * is what stamps stale content as fresh.
 *
 * Sequential on purpose: a rename can touch hundreds of articles, and each pass is a fetch,
 * a build and a write. Running them in parallel turns one editor's save into a burst against
 * the same collection.
 */
export async function batchRegenerateArticleSeo(
  articleIds: string[],
  options?: {
    onProgress?: (completed: number, total: number, current: string) => void;
    onError?: (articleId: string, error: string) => void;
  },
): Promise<{
  successful: number;
  failed: number;
  results: Array<{ articleId: string; success: boolean; error?: string }>;
}> {
  const results: Array<{ articleId: string; success: boolean; error?: string }> = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < articleIds.length; i++) {
    const articleId = articleIds[i];

    try {
      const jsonLd = await generateAndSaveJsonLd(articleId);
      const metadata = await generateAndSaveNextjsMetadata(articleId);

      // An article counts as done only when BOTH blobs rebuilt. One of two is the exact
      // state this function was written to stop: a page whose graph says one name and
      // whose Open Graph tags say another.
      if (jsonLd.success && metadata.success) {
        successful++;
        results.push({ articleId, success: true });
      } else {
        failed++;
        const error = [
          jsonLd.success ? null : `JSON-LD: ${jsonLd.error ?? "unknown"}`,
          metadata.success ? null : `metadata: ${metadata.error ?? "unknown"}`,
        ]
          .filter(Boolean)
          .join(" · ");
        results.push({ articleId, success: false, error });
        options?.onError?.(articleId, error);
      }
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      results.push({ articleId, success: false, error: message });
      options?.onError?.(articleId, message);
    }

    options?.onProgress?.(i + 1, articleIds.length, articleId);
  }

  return { successful, failed, results };
}
