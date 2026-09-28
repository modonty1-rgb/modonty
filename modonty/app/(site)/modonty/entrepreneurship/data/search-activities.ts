import type { ActivityMatch, ActivitySearch } from "../helpers/types";
import { normalizeArabic } from "../../helpers/normalize-arabic";
import { activities } from "./activities";

const LIMIT = 6;

/**
 * The activities whose name holds every word the reader typed. A name that starts with the query
 * comes first (the reader typed the activity itself), then the most registered.
 */
export function searchActivities(query: string): ActivitySearch {
  const q = normalizeArabic(query);
  const words = q.split(" ").filter(Boolean);
  const hits = activities.rows.filter((r) => words.every((w) => r.key.includes(w)));
  const results: ActivityMatch[] = hits
    .map((r) => ({ r, starts: r.key.startsWith(q) || r.key.startsWith(`ال${q}`) }))
    .sort((a, b) => Number(b.starts) - Number(a.starts) || a.r.rank - b.r.rank)
    .slice(0, LIMIT)
    .map(({ r: { code, name, count, rank, level } }) => ({ code, name, count, rank, level }));
  return { total: activities.total, results };
}
