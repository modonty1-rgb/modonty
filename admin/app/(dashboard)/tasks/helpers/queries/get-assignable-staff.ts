import { cache } from "react";

import { db } from "@/lib/db";

export interface AssignableStaff {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

/**
 * The staff who can receive a task — someone who left must not appear in a menu.
 *
 * The filter is `NOT isActive: false`, not `isActive: true`: the field was never
 * backfilled, so absent/null means active and only an explicit `false` means they
 * left. Asking for `true` would silently hide every member whose row predates the
 * field — the same null-vs-absent trap Mongo sets everywhere in this schema.
 */
export const getAssignableStaff = cache(async (): Promise<AssignableStaff[]> => {
  return db.staff.findMany({
    where: { NOT: { isActive: false } },
    select: { id: true, name: true, email: true, image: true, role: true },
    orderBy: { name: "asc" },
    take: 100,
  });
});
