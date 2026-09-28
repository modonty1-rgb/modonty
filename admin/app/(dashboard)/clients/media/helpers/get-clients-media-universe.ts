import "server-only";

import { getMediaLinks } from "@/lib/media/media-links";
import { findIssueMediaIds } from "@/lib/media/find-issue-media-ids";
import { clientsMediaWhere, type ClientsMediaQuery } from "./clients-media-where";

/**
 * What every query on Clients › Media needs first, read once per request: the files each
 * pointer field holds (so no filter runs a `$lookup` per row) and the triangle files. The
 * grid, the counts and the picker then each run their own query in the database — only
 * numbers and one page of cards come back, whatever the size of the library.
 *
 * Before (28 Sep 2026): ~17 queries with relation filters, 6.2 s of server time.
 */
export async function getClientsMediaUniverse(coreClientId: string | null) {
  const [links, issueIds] = await Promise.all([getMediaLinks(), findIssueMediaIds()]);
  return {
    links,
    issueIds,
    where: (query: ClientsMediaQuery) => clientsMediaWhere(coreClientId, links, query),
  };
}

export type ClientsMediaUniverse = Awaited<ReturnType<typeof getClientsMediaUniverse>>;
