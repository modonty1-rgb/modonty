/**
 * Add whole months, clamping the day so 31 Jan + 1 month lands on 28/29 Feb, not 3 Mar.
 *
 * Deliberately in UTC. Local-time arithmetic makes the result depend on where the code
 * runs — the same renewal computed a day apart on a dev machine east of Greenwich and on
 * Vercel (UTC) — and the client preview does the same maths, so both must agree.
 */
export function addMonths(from: Date, months: number): Date {
  const out = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + months, from.getUTCDate()));
  if (out.getUTCDate() < from.getUTCDate()) out.setUTCDate(0);
  return out;
}
