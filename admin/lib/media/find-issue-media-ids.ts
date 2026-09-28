import "server-only";

import { cache } from "react";
import { db } from "@/lib/db";
import { mediaIssueExpr } from "./media-specs";

/**
 * Ids of every file that carries the grid's warning triangle — wrong format, wrong ratio, too
 * small, unknown size — for the «Issues» filter on the section media pages (Khalid, 27 Sep
 * 2026: «ضيف لي الصور اللي عليها ايرورز او عليها تنبيه»). A page ANDs them with its own where.
 *
 * Found inside MongoDB by `mediaIssueExpr`, the same rules as `checkMediaCompliance` the grid
 * paints with. Checked 28 Sep 2026 on all 1173 modonty_dev files: 186 issues both ways, zero
 * ids apart. Only the failing ids come back, so the cost follows the problems, not the library.
 */
export const findIssueMediaIds = cache(async (): Promise<string[]> => {
  const rows = (await db.media.findRaw({
    filter: { $expr: mediaIssueExpr() },
    options: { projection: { _id: 1 } },
  })) as unknown as Array<{ _id: { $oid: string } }>;
  return rows.map((r) => r._id.$oid);
});
