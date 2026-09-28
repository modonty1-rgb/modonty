import type { Prisma } from "@prisma/client";
import { mediaUsedWhere, mediaUnusedWhere, type MediaLinks } from "@/lib/media/usage-where";
import { REEL_LIVE_WHERE, REEL_NOT_LIVE_WHERE } from "@/lib/media/reel-where";
import { mediaSearchWhere } from "@/lib/media/media-search-where";
import { CLIENT_MEDIA_KINDS, type ClientMediaKind } from "./client-media-kinds";

export interface ClientsMediaQuery {
  clientId?: string;
  kind?: ClientMediaKind;
  /** true = used · false = unused · undefined = both. */
  used?: boolean;
  search?: string;
  /** Files already shown elsewhere on the page (the client's page-images box). */
  excludeIds?: string[];
  /** Only these ids — the files with the warning triangle (see findIssueMediaIds). */
  issueIds?: string[];
}

/**
 * The rows Clients › Media shows: files a client owns (not Modonty — the core client has its
 * own page), of a client kind — then the page's three filters and its search.
 *
 * «Used» adds live reels to the shared `mediaUsedWhere`: that clause predates reels, and
 * without it a published reel read «Unused» while the delete guard refused to remove it.
 */
export function clientsMediaWhere(coreClientId: string | null, links: MediaLinks, query: ClientsMediaQuery): Prisma.MediaWhereInput {
  const and: Prisma.MediaWhereInput[] = [
    { clientId: coreClientId ? { not: null, notIn: [coreClientId] } : { not: null } },
    { OR: CLIENT_MEDIA_KINDS.map((k) => k.where(links)) },
  ];

  if (query.clientId) and.push({ clientId: query.clientId });
  if (query.excludeIds?.length) and.push({ id: { notIn: query.excludeIds } });
  if (query.issueIds) and.push({ id: { in: query.issueIds } });

  const kind = CLIENT_MEDIA_KINDS.find((k) => k.value === query.kind);
  if (kind) and.push(kind.where(links));

  if (query.used === true) and.push({ OR: [mediaUsedWhere(links), REEL_LIVE_WHERE] });
  if (query.used === false) and.push({ AND: [mediaUnusedWhere(links), REEL_NOT_LIVE_WHERE] });

  if (query.search) and.push(mediaSearchWhere(query.search));

  return { AND: and };
}
