import { normalizeArabic } from "../../helpers/normalize-arabic";
import type { SchoolMatch, SchoolResult } from "../helpers/types";
import { schools } from "./schools";

const LIMIT = 6;

/**
 * Schools whose name holds every word the reader typed — a name that starts with the query first,
 * then the best ranked. Each result carries the latest year's results, with last year's rank beside
 * each so the reader sees the direction.
 */
export function searchSchools(query: string): { results: SchoolMatch[] } {
  const q = normalizeArabic(query);
  const words = q.split(" ").filter(Boolean);
  const best = (r: (typeof schools.rows)[number]) => Math.min(...r.results.map((x) => x[4]));

  const results = schools.rows
    .filter((r) => words.every((w) => r.key.includes(w)))
    .map((r) => ({ r, starts: r.key.startsWith(q) }))
    .sort((a, b) => Number(b.starts) - Number(a.starts) || best(a.r) - best(b.r))
    .slice(0, LIMIT)
    .map(({ r }): SchoolMatch => {
      const year = Math.max(...r.results.map((x) => x[2]));
      const current: SchoolResult[] = r.results
        .filter((x) => x[2] === year)
        .map(([test, track, y, average, rank]) => ({
          test,
          track,
          year: y,
          average,
          rank,
          outOf: schools.totals[`${y}|${test}|${track}|${r.gender}`] ?? rank,
          previousRank: r.results.find((p) => p[2] === y - 1 && p[0] === test && p[1] === track)?.[4] ?? null,
        }));
      return { name: r.name, region: r.region, gender: r.gender, results: current };
    });

  return { results };
}
