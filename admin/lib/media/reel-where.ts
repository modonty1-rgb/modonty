import type { Prisma } from "@prisma/client";

/**
 * A reel the delete guard still protects — the same two tests as `canDeleteMedia`
 * (`inReels`, or a status that is not yet archived/rejected), so «Used» on this page and
 * «you cannot delete this» never disagree.
 */
export const REEL_LIVE_WHERE: Prisma.MediaWhereInput = {
  OR: [{ inReels: true }, { reelStatus: { in: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "PUBLISHED"] } }],
};

/**
 * The exact complement of `REEL_LIVE_WHERE`, spelled out — NOT `{ NOT: REEL_LIVE_WHERE }`.
 * On MongoDB, `NOT { reelStatus: { in: [...] } }` also drops every row where reelStatus is
 * ABSENT, which is nearly all of them: measured 26 Sep 2026 it matched 1 of 1161 rows, and
 * the «Unused» filter came back empty. Absent, null and the two closed states, listed.
 */
export const REEL_NOT_LIVE_WHERE: Prisma.MediaWhereInput = {
  AND: [
    { NOT: { inReels: true } },
    { OR: [{ reelStatus: { isSet: false } }, { reelStatus: null }, { reelStatus: { in: ["REJECTED", "ARCHIVED"] } }] },
  ],
};
