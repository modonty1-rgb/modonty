import { extractBunnyPath, isBunnyUrl } from "@modonty/shared/lib/bunny";

/**
 * Is this a file the signed-in partner uploaded himself? (security fix, Khalid, 4 Oct 2026)
 *
 * `/api/upload-bunny` writes every partner upload to `clients/<clientId>/<folder>/…` in the
 * reels zone (a dev prefix may sit in front outside production). The gallery and the
 * achievements accepted ANY url and later deleted it from Bunny — so a partner could store
 * another partner's file url and have it erased. Deletes, and new urls, must now pass this.
 */
export function isOwnBunnyUrl(url: string | null | undefined, clientId: string): boolean {
  if (!url || !clientId || !isBunnyUrl("reels", url)) return false;
  const path = extractBunnyPath("reels", url) ?? "";
  return path.includes(`clients/${clientId}/`);
}
