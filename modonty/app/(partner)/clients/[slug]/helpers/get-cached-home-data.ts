import { cacheTag, cacheLife } from "next/cache";
import { getHomeData } from "@modonty/shared/lib/partner-site";
import { db } from "@/lib/db";
import { clientSlugTag } from "@modonty/shared/lib/cache/client-cache-tags";

/** The block data for every partner-site page, cached with the same tag as the rest of the site. */
export async function getCachedHomeData(decodedSlug: string) {
  "use cache";
  // "reels" too: the reels block reads published reels, and publishing one revalidates that tag.
  cacheTag("clients", "reels", clientSlugTag(decodedSlug));
  cacheLife("hours");
  return getHomeData(db, { slug: decodedSlug });
}
