import "server-only";

import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * رابط مقالة (`https://www.modonty.com/articles/<slug>`) ← المقالة وعميلها.
 *
 * السيرفر ما يعرف معرّفات القاعدة (العقد Q3). والـslug فريد **لكل عميل** لا عامّةً، فنحلّه بنفس قاعدة
 * الموقع نفسه (`modonty/app/(site)/articles/[slug]/data/get-article-content-by-slug.ts`: slug + PUBLISHED)
 * — فالمقالة هنا هي اللي يشوفها الزائر على نفس الرابط. `null` = ما فيه مقالة منشورة بهذا الرابط.
 */
export async function resolveArticleUrl(articleUrl: string): Promise<{ articleId: string; clientId: string; slug: string } | null> {
  let slug: string;
  try {
    const parts = new URL(articleUrl).pathname.split("/").filter(Boolean);
    if (parts[0] !== "articles" || !parts[1]) return null;
    slug = decodeURIComponent(parts[1]);
  } catch {
    return null;
  }
  const article = await db.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    select: { id: true, clientId: true },
  });
  return article ? { articleId: article.id, clientId: article.clientId, slug } : null;
}
