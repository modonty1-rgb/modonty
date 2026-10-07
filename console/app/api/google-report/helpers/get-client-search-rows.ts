import { unstable_cache } from "next/cache";

import { getClientPagePaths } from "@/lib/google/get-client-page-paths";
import { queryModontySearch } from "@modonty/shared/lib/google/query-modonty-search";

export type ReportDimension = "date" | "page" | "query";

interface ClientSearchRow {
  date?: string;
  /** Article title, or the client's name for the partner page. */
  page?: string;
  url?: string;
  query?: string;
  impressions: number;
  clicks: number;
  /** position × impressions — summed, then divided by summed impressions, it gives Google's own average. */
  positionWeight: number;
}

/**
 * One client's Google Search rows over a date range, at the grain asked for (any of date/page/query).
 *
 * The grain matters: Google drops rare search terms from query-level rows for privacy, so totals
 * summed from page+query rows fall short of page-level totals. Asking only for the dimensions a
 * chart needs keeps each chart equal to Search Console's own figure. `page` is always queried
 * (it is how a row is recognised as this client's) and folded away when it wasn't asked for.
 *
 * Cached six hours per (client, range, grain); Search Console only moves once a day.
 */
export const getClientSearchRows = unstable_cache(
  async (clientId: string, start: string, end: string, dims: ReportDimension[]) => {
    const pages = await getClientPagePaths(clientId);
    if (!pages) return null;

    const others = dims.filter((d) => d !== "page");
    const raw = await queryModontySearch({ startDate: start, endDate: end, dimensions: ["page", ...others] });

    const merged = new Map<string, ClientSearchRow>();
    for (const r of raw) {
      const url = r.keys[0];
      if (!pages.isMine(url)) continue;
      const row: ClientSearchRow = { impressions: 0, clicks: 0, positionWeight: 0 };
      others.forEach((d, i) => (row[d] = r.keys[i + 1]));
      if (dims.includes("page")) {
        row.url = url;
        row.page = pages.titleOf(url);
      }
      const id = JSON.stringify([row.date, row.url, row.query]);
      const acc = merged.get(id) ?? row;
      acc.impressions += r.impressions;
      acc.clicks += r.clicks;
      acc.positionWeight += r.position * r.impressions;
      merged.set(id, acc);
    }
    return { client: pages.name, rows: [...merged.values()] };
  },
  ["client-search-rows-v1"],
  { revalidate: 6 * 60 * 60, tags: ["gsc-console"] },
);
