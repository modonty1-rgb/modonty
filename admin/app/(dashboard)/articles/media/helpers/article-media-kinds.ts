import type { Prisma } from "@prisma/client";

/**
 * The kinds of file on Articles › Media (Khalid, 26 Sep 2026). Matched by LINK first, never by
 * the stored type alone: measured on modonty_dev the same day, 105 images that articles
 * actually use (27 featured, 78 in article galleries) were uploaded as GENERAL — a type-only
 * page would have hidden them.
 */
export const ARTICLE_MEDIA_KINDS = [
  { value: "featured", label: "Featured image", where: { featuredArticles: { some: {} } } },
  { value: "gallery", label: "Article gallery", where: { articleGallery: { some: {} } } },
  {
    value: "unlinked",
    label: "Not in an article",
    where: { AND: [{ type: "POST" }, { featuredArticles: { none: {} } }, { articleGallery: { none: {} } }] },
  },
] as const satisfies ReadonlyArray<{ value: string; label: string; where: Prisma.MediaWhereInput }>;

export type ArticleMediaKind = (typeof ARTICLE_MEDIA_KINDS)[number]["value"];

/** Every file this page can show: an article image by role, or any file an article uses. */
export const ARTICLE_MEDIA_UNIVERSE: Prisma.MediaWhereInput = {
  OR: [{ type: "POST" }, { featuredArticles: { some: {} } }, { articleGallery: { some: {} } }],
};
