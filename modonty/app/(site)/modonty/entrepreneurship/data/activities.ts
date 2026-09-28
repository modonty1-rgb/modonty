import type { ActivityMatch, CompetitionLevel } from "../helpers/types";
import { normalizeArabic } from "../helpers/normalize-arabic";
import raw from "./activities.json";

/**
 * The Ministry of Commerce's count of commercial registrations per economic activity (national
 * classification, level 3), one quarter at a time — written by `scripts/import-mc-activities.mjs`
 * from the file on the national open data platform, sorted most registered first. Open data licence:
 * use and build on it, naming the source.
 */
const data = raw as { year: number; quarter: number; source: string; activities: [string, string, number][] };

const total = data.activities.length;

/** The top tenth is crowded; below the middle, fewer competitors (or less demand — the page says both). */
function levelOf(rank: number): CompetitionLevel {
  if (rank <= Math.ceil(total * 0.1)) return "busy";
  if (rank <= Math.ceil(total * 0.5)) return "medium";
  return "quiet";
}

export const activities = {
  year: data.year,
  quarter: data.quarter,
  source: data.source,
  total,
  rows: data.activities.map(([code, name, count], i): ActivityMatch & { key: string } => ({
    code,
    name,
    count,
    rank: i + 1,
    level: levelOf(i + 1),
    key: normalizeArabic(name),
  })),
};
