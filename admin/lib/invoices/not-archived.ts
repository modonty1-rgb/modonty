import type { Prisma } from "@prisma/client";

/**
 * «Not archived» on MongoDB. `{ archivedAt: null }` looks right and is a silent trap: it
 * matches only documents where the field EXISTS and holds null — every invoice written
 * before the field was added has no such key, so the filter returned 0 of 8 rows and the
 * recompute wiped a client's end date (caught live 2026-07-24, before any push).
 * Verified against the dev database: eqNull=0, isSet:false=8.
 */
export const NOT_ARCHIVED: Pick<Prisma.InvoiceWhereInput, "OR"> = {
  OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
};
