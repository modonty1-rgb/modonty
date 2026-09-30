/** The dashboard's one period filter — every number on the page reads the same window. */
export const DASHBOARD_PERIODS = [7, 28, 90] as const;
export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

/**
 * `?period=` → 7 | 28 | 90, 28 by default (Google's own default window). Anything else falls
 * back to 28 rather than erroring — a hand-edited URL still gets a working page.
 */
export function getDashboardPeriod(raw: string | string[] | undefined): DashboardPeriod {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return (DASHBOARD_PERIODS as readonly number[]).includes(n) ? (n as DashboardPeriod) : 28;
}
