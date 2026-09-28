import type { Prisma } from "@prisma/client";
import { linkedWhere, notLinkedWhere, type MediaLinks } from "@/lib/media/usage-where";

/**
 * The kinds of file on Articles › Media (Khalid, 26 Sep 2026). Matched by LINK first, never by
 * the stored type alone: measured on modonty_dev the same day, 105 images that articles
 * actually use (27 featured, 78 in article galleries) were uploaded as GENERAL — a type-only
 * page would have hidden them. The links come resolved (see `linkedWhere`), not a `$lookup` per row.
 */
export const ARTICLE_MEDIA_KINDS = [
  { value: "featured", label: "Featured image", where: (l) => linkedWhere(l, "featuredArticles") },
  { value: "gallery", label: "Article gallery", where: (l) => linkedWhere(l, "articleGallery") },
  {
    value: "unlinked",
    label: "Not in an article",
    where: (l) => ({ AND: [{ type: "POST" }, notLinkedWhere(l, "featuredArticles", "articleGallery")] }),
  },
] as const satisfies ReadonlyArray<{ value: string; label: string; where: (l: MediaLinks) => Prisma.MediaWhereInput }>;

export type ArticleMediaKind = (typeof ARTICLE_MEDIA_KINDS)[number]["value"];
