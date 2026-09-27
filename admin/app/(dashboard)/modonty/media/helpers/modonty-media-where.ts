import type { Prisma } from "@prisma/client";
import { MEDIA_USED_WHERE, MEDIA_UNUSED_WHERE } from "@/lib/media/usage-where";
import { REEL_LIVE_WHERE, REEL_NOT_LIVE_WHERE } from "@/lib/media/reel-where";
import { modontyKindWhere, type ModontyMediaKind } from "./modonty-media-kinds";

export interface ModontyMediaQuery {
  kind?: ModontyMediaKind;
  /** true = used · false = unused · undefined = both. */
  used?: boolean;
  search?: string;
  /** Only these ids — the files with the warning triangle (see findIssueMediaIds). */
  issueIds?: string[];
}

/**
 * The rows Modonty › Media shows: everything the core client owns, plus the old PLATFORM rows
 * that were never claimed by it (no client — the listing-page images live there). Then the
 * page's kind, usage and search.
 *
 * «Used» = the shared clause + live reels + a site setting holding the file's URL; «Unused» is
 * its exact complement, spelled out (MongoDB `NOT {in}` drops rows missing the field).
 */
export function modontyMediaWhere(coreClientId: string, siteUrls: string[], query: ModontyMediaQuery): Prisma.MediaWhereInput {
  const and: Prisma.MediaWhereInput[] = [
    { OR: [{ clientId: coreClientId }, { AND: [{ clientId: null }, { scope: "PLATFORM" }] }] },
  ];

  if (query.kind) and.push(modontyKindWhere(query.kind, siteUrls));
  if (query.issueIds) and.push({ id: { in: query.issueIds } });

  const inSettings: Prisma.MediaWhereInput = { OR: [{ url: { in: siteUrls } }, { bunnyUrl: { in: siteUrls } }] };
  if (query.used === true) and.push({ OR: [MEDIA_USED_WHERE, REEL_LIVE_WHERE, inSettings] });
  if (query.used === false) {
    and.push({
      AND: [
        MEDIA_UNUSED_WHERE,
        REEL_NOT_LIVE_WHERE,
        { url: { notIn: siteUrls } },
        { OR: [{ bunnyUrl: { isSet: false } }, { bunnyUrl: null }, { bunnyUrl: { notIn: siteUrls } }] },
      ],
    });
  }

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
