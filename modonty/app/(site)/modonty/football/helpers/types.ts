/** What the football page shows — already filtered to one league and already in Arabic. */

/**
 * `unconfirmed`: انتهت والمصدران (الموقع الرسمي · 365Scores) لم يتّفقا على النتيجة بعد — تُعرض بلا أرقام
 * (خالد ١٥ أكتوبر ٢٠٢٦: «أي نتيجة نقارنها قبل ما ننشرها»).
 */
export type MatchState = "upcoming" | "live" | "finished" | "off" | "unconfirmed";

export interface Match {
  id: string;
  /** ISO kickoff time, UTC. */
  kickoff: string;
  state: MatchState;
  /** Minute on the clock while live; null otherwise. */
  minute: number | null;
  /** Short status from the radar feed (NS · LIVE · HT · FT · PST · UNC) — kept for the label. */
  status: string;
  round: string | null;
  venue: string | null;
  home: MatchSide;
  away: MatchSide;
}

export interface MatchSide {
  /** The club's short Arabic name from the official league site. */
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
  /** Unused since the official source names clubs in Arabic (15 Oct 2026); kept empty for the shape. */
  clubNames: Record<string, string>;
}
