import "server-only";

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { checkMediaCompliance } from "./media-specs";

/**
 * Ids of the files in `where` that carry the grid's warning triangle — wrong format, wrong
 * ratio, too small, unknown size — for the «Issues» filter on the section media pages
 * (Khalid, 27 Sep 2026: «ضيف لي الصور اللي عليها ايرورز او عليها تنبيه»).
 *
 * Runs the SAME `checkMediaCompliance` the grid paints with, in JS over the five fields it
 * reads. A second copy of those rules as a Prisma where (ratio needs width÷height, which a
 * where cannot express) would drift, and then the filter and the triangles would disagree.
 */
export async function findIssueMediaIds(where: Prisma.MediaWhereInput): Promise<string[]> {
  const rows = await db.media.findMany({
    where,
    select: { id: true, type: true, mimeType: true, filename: true, width: true, height: true },
  });
  return rows.filter((r) => !checkMediaCompliance(r).ok).map((r) => r.id);
}
