import { cacheLife } from "next/cache";

import { matchClubName } from "../helpers/match-club-name";
import { riyadhDate } from "../helpers/riyadh-date";
import type { LeagueTable, Match } from "../helpers/types";
import { getClubCrests } from "./get-club-crests";
import { getDayFixtures } from "./get-day-fixtures";
import { getLeagueTable } from "./get-league-table";

export interface MatchDay {
  date: string;
  matches: Match[];
  /** False when the day could not be read (refused, failed) — its empty list is not «no matches». */
  known: boolean;
}

export interface FootballPage {
  /** The match the page leads with: live, else the next kickoff, else today's last result. */
  lead: Match | null;
  days: { yesterday: MatchDay; today: MatchDay; tomorrow: MatchDay };
  table: LeagueTable | null;
  /** Arabic club name → crest URL. A club missing here keeps its letter mark. */
  crests: Record<string, string>;
  /** Oldest copy on the page — what «آخر تحديث» honestly means. */
  updatedAt: string | null;
}

function pickLead(today: Match[], tomorrow: Match[]): Match | null {
  return (
    today.find((m) => m.state === "live") ??
    today.find((m) => m.state === "upcoming") ??
    tomorrow.find((m) => m.state === "upcoming") ??
    today.filter((m) => m.state === "finished").at(-1) ??
    null
  );
}

/**
 * Everything the football page shows, assembled once per five minutes.
 *
 * The five minutes bound how often the page re-reads `feed_snapshots`; the snapshots bound
 * how often the sources are called. Two layers on purpose — this one is per instance and
 * cheap, the other is site-wide and guards API-Football's 100-a-day quota.
 */
export async function getFootballPage(): Promise<FootballPage> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });

  const now = new Date();
  const [yesterday, today, tomorrow] = [riyadhDate(now, -1), riyadhDate(now), riyadhDate(now, 1)];

  const [table, past, present, next, crestsByApiName] = await Promise.all([
    getLeagueTable(now),
    getDayFixtures(yesterday, today, now),
    getDayFixtures(today, today, now),
    getDayFixtures(tomorrow, today, now),
    getClubCrests(),
  ]);

  const names = table.data?.clubNames ?? {};
  const inArabic = (matches: Match[] | null): Match[] =>
    (matches ?? []).map((m) => ({
      ...m,
      home: { ...m.home, name: matchClubName(m.home.name, names) ?? m.home.name },
      away: { ...m.away, name: matchClubName(m.away.name, names) ?? m.away.name },
    }));

  const days = {
    yesterday: { date: yesterday, matches: inArabic(past.data), known: past.data !== null },
    today: { date: today, matches: inArabic(present.data), known: present.data !== null },
    tomorrow: { date: tomorrow, matches: inArabic(next.data), known: next.data !== null },
  };

  const crests: Record<string, string> = {};
  for (const [english, arabic] of Object.entries(names)) {
    const url = matchClubName(english, crestsByApiName.data ?? {});
    if (url) crests[arabic] = url;
  }

  const stamps = [table, past, present, next].map((s) => s.fetchedAt?.getTime()).filter((t): t is number => !!t);

  return {
    lead: pickLead(days.today.matches, days.tomorrow.matches),
    days,
    table: table.data,
    crests,
    updatedAt: stamps.length ? new Date(Math.min(...stamps)).toISOString() : null,
  };
}
