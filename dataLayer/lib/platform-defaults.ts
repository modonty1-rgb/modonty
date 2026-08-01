import "server-only";

import { db } from "./db";
import { mediaSrc } from "./media-src";

/**
 * Platform default images (managed in admin → /settings/defaults).
 *
 * Source of truth = the three PLATFORM-scope Media rows with `clientId: null`, keyed by
 * type (LOGO / POST / HERO). Renderers fall back to these when an entity has no image:
 * client with no logo → LOGO, article with no featured image → POST, client page with
 * no hero → HERO (Khalid 2026-08-01). Each value is the Bunny copy via `mediaSrc`.
 */
export interface PlatformDefaultImages {
  logo: string | null;
  post: string | null;
  hero: string | null;
}

export async function getPlatformDefaultImages(): Promise<PlatformDefaultImages> {
  const rows = await db.media.findMany({
    where: { scope: "PLATFORM", clientId: null, type: { in: ["LOGO", "POST", "HERO"] } },
    select: { type: true, url: true, bunnyUrl: true },
  });

  const result: PlatformDefaultImages = { logo: null, post: null, hero: null };
  for (const r of rows) {
    if (r.type === "LOGO") result.logo = mediaSrc(r);
    else if (r.type === "POST") result.post = mediaSrc(r);
    else if (r.type === "HERO") result.hero = mediaSrc(r);
  }
  return result;
}
