import { cacheTag, cacheLife } from "next/cache";
import { getHomeData } from "@modonty/shared/lib/partner-site";
import { db } from "@/lib/db";

/** The block data for every partner-site page, cached with the same tag as the rest of the site. */
export async function getCachedHomeData(decodedSlug: string) {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");
  return getHomeData(db, { slug: decodedSlug });
}
