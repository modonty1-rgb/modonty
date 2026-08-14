import "server-only";

import { db } from "./db";
import { mediaSrc } from "./media-src";

/**
 * Platform default images (managed in admin → /settings/defaults).
 *
 * Renderers fall back to these when an entity has no image: client with no logo → LOGO,
 * article with no featured image → POST, client page with no hero → HERO (Khalid 2026-08-01).
 * Each value is the Bunny copy via `mediaSrc`.
 *
 * Lookup key = the STABLE filename (`platform-default-*`, set in admin defaults-actions),
 * NOT scope/clientId. The old `scope: PLATFORM + clientId: null` filter broke the moment
 * T2b claimed these rows for the core client (scope→CLIENT, clientId→core) — verified on
 * dev 2026-08-07: the old query returned 0 after T2b while the rows still exist under
 * their filenames. Filename survives ownership changes; ownership doesn't.
 */
export interface PlatformDefaultImages {
  logo: string | null;
  post: string | null;
  hero: string | null;
}

const DEFAULT_FILENAMES = {
  "platform-default-logo": "logo",
  "platform-default-post": "post",
  "platform-default-hero": "hero",
} as const;

export async function getPlatformDefaultImages(): Promise<PlatformDefaultImages> {
  const rows = await db.media.findMany({
    where: { filename: { in: Object.keys(DEFAULT_FILENAMES) } },
    select: { filename: true, url: true, bunnyUrl: true, blurDataURL: true },
  });

  const result: PlatformDefaultImages = { logo: null, post: null, hero: null };
  for (const r of rows) {
    const key = DEFAULT_FILENAMES[r.filename as keyof typeof DEFAULT_FILENAMES];
    if (key) result[key] = mediaSrc(r);
  }
  return result;
}
