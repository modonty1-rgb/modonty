/** What the football page shows — already filtered to one league and already in Arabic. */

export type MatchState = "upcoming" | "live" | "finished" | "off";

export interface Match {
  id: number;
  /** ISO kickoff time, UTC. */
  kickoff: string;
  state: MatchState;
  /** Minute on the clock while live; null otherwise. */
  minute: number | null;
  /** API-Football's short status (NS · 1H · HT · FT · PST …) — kept for the label. */
  status: string;
  round: string | null;
  venue: string | null;
  home: MatchSide;
  away: MatchSide;
}

export interface MatchSide {
  /** API-Football's English name; the page swaps in the Arabic one from the league table. */
  name: string;
  goals: number | null;
}

export interface TableRow {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  /** From the article's qualification column: any AFC competition, or relegation. */
  zone: "asia" | "drop" | null;
}

export interface Scorer {
  rank: number;
  player: string;
  club: string;
  goals: number;
}

export interface LeagueTable {
  rows: TableRow[];
  scorers: Scorer[];
  /** Wikipedia's English club name → short Arabic name, used to translate API-Football's clubs. */
  clubNames: Record<string, string>;
}
