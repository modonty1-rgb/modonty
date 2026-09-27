/**
 * «2026-09-27» — the calendar day in Riyadh, `offsetDays` from `now`.
 *
 * Matches are grouped by the day a Saudi fan lives in, not by UTC: a 23:30 kickoff in Riyadh
 * is 20:30 UTC the same day, but a 01:00 one would land on the previous UTC date.
 */
export function riyadhDate(now: Date, offsetDays = 0): string {
  const shifted = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(shifted);
}
