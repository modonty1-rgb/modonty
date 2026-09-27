import "server-only";

import { db } from "@/lib/db";
import { CLIENT_MEDIA_KINDS, type ClientMediaKind } from "./client-media-kinds";
import { clientsMediaWhere, type ClientsMediaQuery } from "./clients-media-where";

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
  coreClientId: string | null,
  active: Pick<ClientsMediaQuery, "clientId" | "kind" | "used" | "search">,
  /** The universe's triangle files, and whether the «Issues» filter is on. */
  issues: { ids: string[]; on: boolean },
) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const { clientId, kind, used, search } = active;
  const issueIds = issues.on ? issues.ids : undefined;
  const perClient = clientsMediaWhere(coreClientId, { clientId });

  const [kinds, all, usedN, unusedN, createdThisMonth, reelsPending, issuesN] = await Promise.all([
    // type counts: client + usage
    Promise.all(CLIENT_MEDIA_KINDS.map((k) => db.media.count({ where: clientsMediaWhere(coreClientId, { clientId, search, used, issueIds, kind: k.value }) }))),
    db.media.count({ where: clientsMediaWhere(coreClientId, { clientId, search, used, issueIds }) }),
    // usage counts: client + type
    db.media.count({ where: clientsMediaWhere(coreClientId, { clientId, search, kind, issueIds, used: true }) }),
    db.media.count({ where: clientsMediaWhere(coreClientId, { clientId, search, kind, issueIds, used: false }) }),
    db.media.count({ where: { AND: [perClient, { createdAt: { gte: startOfMonth } }] } }),
    // same filters as the Reels number beside it — «Reels 0 · 2 pending» was the badge ignoring search
    db.media.count({ where: { AND: [clientsMediaWhere(coreClientId, { clientId, search, used, issueIds, kind: "reels" }), { reelStatus: "PENDING_APPROVAL" }] } }),
    // issues: client + type + usage
    db.media.count({ where: clientsMediaWhere(coreClientId, { clientId, search, kind, used, issueIds: issues.ids }) }),
  ]);

  const byKind = Object.fromEntries(CLIENT_MEDIA_KINDS.map((k, i) => [k.value, kinds[i]])) as Record<ClientMediaKind, number>;
  return { all, used: usedN, unused: unusedN, createdThisMonth, reelsPending, byKind, issues: issuesN };
}
