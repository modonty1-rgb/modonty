import { unstable_cache } from "next/cache";
import { getTopPages } from "./gsc-analytics";

const TAG = "gsc-dashboard";
const REVALIDATE = 60 * 60 * 3;

export const getCachedTopPages = unstable_cache(
  async (days: number, limit: number) => getTopPages(days, limit),
  ["gsc:top-pages"],
  { revalidate: REVALIDATE, tags: [TAG] },
);
