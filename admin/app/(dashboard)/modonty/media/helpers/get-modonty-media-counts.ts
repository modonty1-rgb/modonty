import "server-only";

import { db } from "@/lib/db";
import type { MediaLinks } from "@/lib/media/usage-where";
import { startOfThisMonth } from "@/lib/media/start-of-this-month";
import { MODONTY_MEDIA_KINDS, type ModontyMediaKind } from "./modonty-media-kinds";
import { modontyMediaWhere, type ModontyMediaQuery } from "./modonty-media-where";

/**
 * Each filter's number counted WITH the other filters that are on, so a number is always
 * the number of cards that filter would show — the rule Clients › Media settled on.
 */
export async function getModontyMediaCounts(
  coreClientId: string,
  siteUrls: string[],
  links: MediaLinks,
  active: Omit<ModontyMediaQuery, "issueIds">,
  /** The universe's triangle files, and whether the «Issues» filter is on. */
  issues: { ids: string[]; on: boolean },
) {
  const { kind, used } = active;
  const search = active.search;
  const issueIds = issues.on ? issues.ids : undefined;
  const w = (q: ModontyMediaQuery) => modontyMediaWhere(coreClientId, siteUrls, links, q);

  const [kinds, all, usedN, unusedN, createdThisMonth, reelsPending, issuesN] = await Promise.all([
    Promise.all(MODONTY_MEDIA_KINDS.map((k) => db.media.count({ where: w({ search, used, issueIds, kind: k.value }) }))),
    db.media.count({ where: w({ search, used, issueIds }) }),
    db.media.count({ where: w({ search, kind, issueIds, used: true }) }),
    db.media.count({ where: w({ search, kind, issueIds, used: false }) }),
    db.media.count({ where: { AND: [w({}), { createdAt: { gte: startOfThisMonth() } }] } }),
    db.media.count({ where: { AND: [w({ search, used, issueIds, kind: "reels" }), { reelStatus: "PENDING_APPROVAL" }] } }),
    db.media.count({ where: w({ search, kind, used, issueIds: issues.ids }) }),
  ]);

  const byKind = Object.fromEntries(MODONTY_MEDIA_KINDS.map((k, i) => [k.value, kinds[i]])) as Record<ModontyMediaKind, number>;
  return { all, used: usedN, unused: unusedN, createdThisMonth, reelsPending, byKind, issues: issuesN };
}
