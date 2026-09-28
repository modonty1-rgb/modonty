import "server-only";

import { db } from "@/lib/db";
import { startOfThisMonth } from "@/lib/media/start-of-this-month";
import { CLIENT_MEDIA_KINDS, type ClientMediaKind } from "./client-media-kinds";
import type { ClientsMediaQuery } from "./clients-media-where";
import type { ClientsMediaUniverse } from "./get-clients-media-universe";

/**
 * The number on each filter, counted WITH the other filters that are on — so a number is
 * always the number of cards that filter would show.
 *
 * It first counted each filter alone: with «Logo» on, the usage menu said «Unused · 9» and
 * the grid showed 3 (Khalid, 26 Sep 2026: «كاتب لي ان يوز تسعة واللي قدامي ثلاثة»). The 9 was
 * every unused file of every kind. Now a type's number respects client + usage + search, and a
 * usage number respects client + type + search. Search counts too: with it left out, «cover»
 * showed 32 cards under «All 258» — the same mismatch one filter over.
 */
export async function getClientsMediaCounts(
  { where, issueIds }: ClientsMediaUniverse,
  active: Pick<ClientsMediaQuery, "clientId" | "kind" | "used" | "search">,
  /** Whether the «Issues» filter is on. */
  issuesOn: boolean,
) {
  const { clientId, kind, used, search } = active;
  const onlyIssues = issuesOn ? issueIds : undefined;
  const count = (q: ClientsMediaQuery) => db.media.count({ where: where(q) });

  const [kinds, all, usedN, unusedN, createdThisMonth, reelsPending, issuesN] = await Promise.all([
    // type counts: client + usage
    Promise.all(CLIENT_MEDIA_KINDS.map((k) => count({ clientId, search, used, issueIds: onlyIssues, kind: k.value }))),
    count({ clientId, search, used, issueIds: onlyIssues }),
    // usage counts: client + type
    count({ clientId, search, kind, issueIds: onlyIssues, used: true }),
    count({ clientId, search, kind, issueIds: onlyIssues, used: false }),
    db.media.count({ where: { AND: [where({ clientId }), { createdAt: { gte: startOfThisMonth() } }] } }),
    // same filters as the Reels number beside it — «Reels 0 · 2 pending» was the badge ignoring search
    db.media.count({ where: { AND: [where({ clientId, search, used, issueIds: onlyIssues, kind: "reels" }), { reelStatus: "PENDING_APPROVAL" }] } }),
    // issues: client + type + usage
    count({ clientId, search, kind, used, issueIds }),
  ]);

  const byKind = Object.fromEntries(CLIENT_MEDIA_KINDS.map((k, i) => [k.value, kinds[i]])) as Record<ClientMediaKind, number>;
  return { all, used: usedN, unused: unusedN, createdThisMonth, reelsPending, byKind, issues: issuesN };
}
