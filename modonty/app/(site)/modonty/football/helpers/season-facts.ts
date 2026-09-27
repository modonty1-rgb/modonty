import type { TableRow } from "./types";

export interface SeasonFact {
  key: "attack" | "defence" | "unbeaten" | "draws";
  /** Every club sharing the record — a tie is shown as a tie, never broken by us. */
  teams: string[];
  value: number;
}

/** All rows holding the extreme of `pick`; empty when no row qualifies. */
function leaders(rows: TableRow[], pick: (r: TableRow) => number, best: "max" | "min"): { teams: string[]; value: number } {
  if (!rows.length) return { teams: [], value: 0 };
  const values = rows.map(pick);
  const value = best === "max" ? Math.max(...values) : Math.min(...values);
  return { teams: rows.filter((r) => pick(r) === value).map((r) => r.team), value };
}

/**
 * Records read straight off the standings — nothing here that the table itself does not say.
 *
 * Verified 27 Sep 2026: goals for and against matched ESPN for all 18 clubs, and the top six
 * matched Thmanyah's club stats. Positions by round were checked too and left out: ten
 * placements across four rounds did not match a rebuild from the results.
 */
export function seasonFacts(rows: TableRow[]): SeasonFact[] {
  const attack = leaders(rows, (r) => r.goalsFor, "max");
  const defence = leaders(rows, (r) => r.goalsAgainst, "min");
  const unbeaten = rows.filter((r) => r.played > 0 && r.lost === 0).map((r) => r.team);
  const draws = leaders(rows, (r) => r.drawn, "max");

  const facts: SeasonFact[] = [
    { key: "attack", ...attack },
    { key: "defence", ...defence },
  ];
  // No number: clubs can have played different counts, and «no defeat» is the whole fact.
  if (unbeaten.length) facts.push({ key: "unbeaten", teams: unbeaten, value: 0 });
  if (draws.value > 0) facts.push({ key: "draws", ...draws });
  return facts;
}
