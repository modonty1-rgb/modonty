import type { Drug } from "../helpers/types";
import { getDrugs } from "./get-drugs";

const LIMIT = 10;

/**
 * Registered drugs whose trade name or active ingredient holds every word typed (the list is in
 * English). Trade-name matches first. Rows as the authority lists them — never called alternatives:
 * strength and form differ, and switching is the doctor's or pharmacist's call (Khalid, 28 Sep 2026).
 */
export async function searchDrugs(query: string): Promise<{ results: Drug[]; total: number }> {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = (await getDrugs())
    .map((d) => ({ d, trade: d.trade.toLowerCase(), key: `${d.trade} ${d.scientific}`.toLowerCase() }))
    .filter((x) => words.every((w) => x.key.includes(w)));
  const byTrade = (x: (typeof hits)[number]) => (words.every((w) => x.trade.includes(w)) ? 0 : 1);
  return {
    total: hits.length,
    results: hits
      .sort((a, b) => byTrade(a) - byTrade(b) || a.trade.localeCompare(b.trade))
      .slice(0, LIMIT)
      .map((x) => x.d),
  };
}
