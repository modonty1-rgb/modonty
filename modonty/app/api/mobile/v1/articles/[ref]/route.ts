import { getArticleBySlugMinimal } from "@/app/(site)/articles/[slug]/data";
import { getArticlePageData } from "@/app/(site)/articles/[slug]/helpers/get-article-page-data";
import { articleDetailShape } from "@/lib/mobile-api/article-detail-shape";
import { fail, handle, MESSAGES, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";

/**
 * C4 — GET /api/mobile/v1/articles/:slug · public.
 * The article exactly as `/articles/[slug]` reads it (`getArticlePageData`). The existence check
 * runs first through the same cached read the page uses, because `getArticlePageData` answers a
 * missing slug with `notFound()` — a page signal, not something a JSON endpoint should throw.
 */
export const GET = handle("article", async (_request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.articleNotFound);

  if (!(await getArticleBySlugMinimal(slug))) return fail("NOT_FOUND", MESSAGES.articleNotFound);

  const data = await getArticlePageData(slug);
  return ok({ article: articleDetailShape(data) }, PUBLIC_CACHE);
});
