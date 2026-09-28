import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/lib/db";

/**
 * The places the editor hid from the guide (Modonty › Sectors › Entertainment). Tagged «pages» —
 * the tag the admin's save busts, like the hero.
 */
export async function getHiddenPlaces(): Promise<string[]> {
  "use cache";
  cacheTag("pages");
  cacheLife("hours");

  const row = await db.sectorPage.findUnique({ where: { sector: "entertainment" }, select: { hiddenPlaces: true } });
  return row?.hiddenPlaces ?? [];
}
