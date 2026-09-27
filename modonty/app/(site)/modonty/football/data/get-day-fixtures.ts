import type { Match, MatchState } from "../helpers/types";
import { readSnapshot, type Snapshot } from "./read-snapshot";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** API-Football's id for the Saudi Pro League (league 307, country «Saudi-Arabia»). */
const SAUDI_PRO_LEAGUE = 307;

/** Status codes as the API-Football v3 docs list them («Available fixtures status»). */
const LIVE = new Set(["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"]);
const FINISHED = new Set(["FT", "AET", "PEN"]);
const OFF = new Set(["PST", "CANC", "ABD", "AWD", "WO"]);

const stateOf = (status: string): MatchState =>
  LIVE.has(status) ? "live" : FINISHED.has(status) ? "finished" : OFF.has(status) ? "off" : "upcoming";

interface ApiFixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null }; venue: { name: string | null } };
  league: { id: number; round: string | null };
  teams: { home: { name: string }; away: { name: string } };
  goals: { home: number | null; away: number | null };
}

async function loadDay(date: string): Promise<Match[]> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new Error("API_FOOTBALL_KEY is not set");

  // The free plan answers only by date for the whole world — a league filter needs a season,
  // and the season is refused. So this pulls every match of the day (1.1 MB, 1,155 matches on
  // 26 Sep 2026) and keeps the one league. The snapshot stores the few that remain.
  const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}&timezone=Asia/Riyadh`, {
    headers: { "x-apisports-key": key },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`api-football ${res.status}`);
  const json = (await res.json()) as { errors?: unknown; response?: ApiFixture[] };
  // The API answers 200 with the reason in `errors` (quota, plan, bad parameter).
  const errors = json.errors && typeof json.errors === "object" ? Object.values(json.errors) : [];
  if (errors.length) throw new Error(`api-football: ${JSON.stringify(json.errors).slice(0, 200)}`);

  return (json.response ?? [])
    .filter((f) => f.league.id === SAUDI_PRO_LEAGUE)
    .map((f) => ({
      id: f.fixture.id,
      kickoff: f.fixture.date,
      state: stateOf(f.fixture.status.short),
      minute: f.fixture.status.elapsed,
      status: f.fixture.status.short,
      round: f.league.round,
      venue: f.fixture.venue.name,
      home: { name: f.teams.home.name, goals: f.goals.home },
      away: { name: f.teams.away.name, goals: f.goals.away },
    }))
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
}

/**
 * How long a day's copy stays good — the whole quota plan lives here.
 *
 * The free plan is 100 calls a day, shared by every day we show. A match in progress is
 * refreshed every 10 minutes; before the next kickoff the copy lives until just before it
 * (at most an hour); yesterday and tomorrow hardly change. On a three-match day that is
 * about 45 calls for today, 8 for tomorrow and 2 for yesterday.
 */
function maxAgeFor(date: string, today: string, now: Date) {
  return (previous: Match[] | null): number => {
    if (date < today) return 12 * HOUR;
    if (date > today) return 3 * HOUR;
    if (!previous) return 0;
    if (previous.some((m) => m.state === "live")) return 10 * MINUTE;
    const nextKickoff = previous
      .filter((m) => m.state === "upcoming")
      .map((m) => Date.parse(m.kickoff))
      .sort((a, b) => a - b)[0];
    if (nextKickoff === undefined) return 3 * HOUR;
    const until = nextKickoff - now.getTime();
    return until <= 15 * MINUTE ? 10 * MINUTE : Math.min(HOUR, until - 10 * MINUTE);
  };
}

/** Saudi Pro League matches on one Riyadh calendar day (`2026-09-27`). */
export async function getDayFixtures(date: string, today: string, now: Date): Promise<Snapshot<Match[]>> {
  // The free plan's window is yesterday–tomorrow on the API's own calendar, which is UTC. From
  // midnight to 03:00 in Riyadh our «tomorrow» is two UTC days ahead and is refused (measured
  // 28 Sep 2026: «try from 2026-09-26 to 2026-09-28» for 2026-09-29). Not asking keeps the log
  // clean and the quota whole; the day opens at 03:00 Riyadh.
  if (date > new Date(now.getTime() + DAY).toISOString().slice(0, 10)) return { data: null, fetchedAt: null };
  return readSnapshot(`football:fixtures:${date}`, maxAgeFor(date, today, now), () => loadDay(date));
}
