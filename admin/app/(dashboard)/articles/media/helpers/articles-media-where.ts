import type { Prisma } from "@prisma/client";
import { MEDIA_USED_WHERE, MEDIA_UNUSED_WHERE } from "@/lib/media/usage-where";
import { ARTICLE_MEDIA_KINDS, ARTICLE_MEDIA_UNIVERSE, type ArticleMediaKind } from "./article-media-kinds";

export interface ArticlesMediaQuery {
  clientId?: string;
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
 * The rows Articles › Media shows — every client's article images, Modonty's included (its
 * articles are articles too; its OWN page images live under Modonty › Media) — then the
 * page's filters. Picking an article narrows to that article's featured image and gallery.
 */
export function articlesMediaWhere(query: ArticlesMediaQuery): Prisma.MediaWhereInput {
  const and: Prisma.MediaWhereInput[] = [ARTICLE_MEDIA_UNIVERSE];

  if (query.clientId) and.push({ clientId: query.clientId });
  if (query.articleId) {
    and.push({
      OR: [
        { featuredArticles: { some: { id: query.articleId } } },
        { articleGallery: { some: { articleId: query.articleId } } },
      ],
    });
  }
  if (query.excludeIds?.length) and.push({ id: { notIn: query.excludeIds } });
  if (query.issueIds) and.push({ id: { in: query.issueIds } });

  const kind = ARTICLE_MEDIA_KINDS.find((k) => k.value === query.kind);
  if (kind) and.push(kind.where);

  if (query.used === true) and.push(MEDIA_USED_WHERE);
  if (query.used === false) and.push(MEDIA_UNUSED_WHERE);

  if (query.search) {
    and.push({
      OR: [
        { filename: { contains: query.search, mode: "insensitive" } },
        { altText: { contains: query.search, mode: "insensitive" } },
        { title: { contains: query.search, mode: "insensitive" } },
      ],
    });
  }

  return { AND: and };
}
