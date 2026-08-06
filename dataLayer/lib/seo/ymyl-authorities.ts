import "server-only";

import type { YmylCategory } from "@prisma/client";

import { db } from "../db";

/**
 * Live licensing-authority codes for one country + YMYL category.
 *
 * Single source for every path that validates `ymylData.authority`. It exists because
 * those paths had drifted: the console dropdown was built from these rows (admin →
 * Reference Data) while the completeness badge, the profile save and the publish gate
 * all validated against a hardcoded matrix in `ymyl-config.ts`. Any authority the admin
 * added — `eds` for Egypt was the live example — was therefore offered to the client and
 * then rejected by the system: permanent red badge, refused save, blocked publishing
 * (Khalid 2026-08-04).
 *
 * Returns `[]` when the client has no country/category yet, or when Reference Data has
 * no rows for that pair. Callers pass the result straight to `validateYmylData`, whose
 * contract is "empty list ⇒ skip the membership check" — so an empty Reference Data
 * degrades to accepting any value rather than locking every client out.
 */
export async function getYmylAuthorityCodes(
  countryCode: string | null | undefined,
  category: string | null | undefined
): Promise<string[]> {
  if (!countryCode || !category) return [];

  const rows = await db.licensingAuthority.findMany({
    where: { isActive: true, countryCode, category: category as YmylCategory },
    orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    select: { code: true },
    take: 100,
  });

  return rows.map((r) => r.code);
}
