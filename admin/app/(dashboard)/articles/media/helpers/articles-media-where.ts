import type { Prisma } from "@prisma/client";
import { linkedWhere, mediaUsedWhere, mediaUnusedWhere, type MediaLinks } from "@/lib/media/usage-where";
import { mediaSearchWhere } from "@/lib/media/media-search-where";
import { ARTICLE_MEDIA_KINDS, type ArticleMediaKind } from "./article-media-kinds";

export interface ArticlesMediaQuery {
  clientId?: string;
  /** The picked article; its files come resolved in `articleFiles` (see the universe). */
  articleId?: string;
  kind?: ArticleMediaKind;
  /** true = used · false = unused · undefined = both. */
  used?: boolean;
  search?: string;
  /** Files already shown elsewhere on the page (the article's featured-image box). */
  excludeIds?: string[];
  /** Only these ids — the files with the warning triangle (see findIssueMediaIds). */
  issueIds?: string[];
}

/**
 * The rows Articles › Media shows: every file an article image by role, or any file an
 * article uses (featured or in a gallery) — then the page's filters and search.
 * `articleFiles` = the picked article's featured image and gallery, read by the universe.
 */
export function articlesMediaWhere(links: MediaLinks, articleFiles: string[] | null, query: ArticlesMediaQuery): Prisma.MediaWhereInput {
  const and: Prisma.MediaWhereInput[] = [{ OR: [{ type: "POST" }, linkedWhere(links, "featuredArticles", "articleGallery")] }];

  if (query.clientId) and.push({ clientId: query.clientId });
  if (query.articleId) and.push({ id: { in: articleFiles ?? [] } });
  if (query.excludeIds?.length) and.push({ id: { notIn: query.excludeIds } });
  if (query.issueIds) and.push({ id: { in: query.issueIds } });

  const kind = ARTICLE_MEDIA_KINDS.find((k) => k.value === query.kind);
  if (kind) and.push(kind.where(links));

  if (query.used === true) and.push(mediaUsedWhere(links));
  if (query.used === false) and.push(mediaUnusedWhere(links));

  if (query.search) and.push(mediaSearchWhere(query.search));

  return { AND: and };
}
