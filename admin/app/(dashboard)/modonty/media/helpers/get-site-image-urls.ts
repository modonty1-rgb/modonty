import "server-only";

import { db } from "@/lib/db";

/**
 * The image URLs Modonty's site settings hold as plain strings (logo, icon, share image,
 * listing-page images). These have no relation to a Media row — the row is found by URL —
 * so «is this Modonty file in use?» has to ask Settings too.
 */
export async function getSiteImageUrls(): Promise<string[]> {
  const s = await db.settings.findFirst({
    select: {
      logoUrl: true,
      logoIconUrl: true,
      ogImageUrl: true,
      certificateImageUrl: true,
      categoriesPageImage: true,
      tagsPageImage: true,
      industriesPageImage: true,
    },
  });
  return s ? [...new Set(Object.values(s).filter((u): u is string => !!u))] : [];
}
