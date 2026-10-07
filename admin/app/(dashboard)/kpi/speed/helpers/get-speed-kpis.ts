import { unstable_cache } from "next/cache";

import { fetchCruxHistory, type CruxDevice, type CruxPeriod } from "../../helpers/crux-history";

export const SITE_ORIGIN = "https://www.modonty.com";

/** One page per kind. CrUX has no «page type» — only an origin or an exact URL. */
const PAGE_TYPES = [
  { label: "Home", path: "/" },
  { label: "Articles", path: "/articles" },
  { label: "Clients", path: "/clients" },
  { label: "Reels", path: "/reels" },
] as const;

interface DeviceSpeed {
  device: CruxDevice;
  /** Latest 28-day window, or null when Google has no record for the site on this device. */
  latest: CruxPeriod | null;
  /** Back-to-back 28-day windows, newest first — one per month, so none overlap. */
  months: CruxPeriod[];
}

interface PageTypeSpeed {
  label: string;
  path: string;
  /** Latest phone window for this exact URL; null = too few Chrome visitors for Google to report it. */
  latest: CruxPeriod | null;
}

interface SpeedKpis {
  devices: DeviceSpeed[];
  pages: PageTypeSpeed[];
  fetchedAt: string;
}

const hasData = (p: CruxPeriod) => Boolean(p.lcp || p.inp || p.cls);

/**
 * One row per calendar month: its last weekly window that Google reported. Weeks with too few
 * visitors come back empty (measured 2 Oct 2026: phone had June–July, then nothing until 12 Sep),
 * so a fixed every-4th-week pick landed mostly on blanks.
 */
function monthly(periods: CruxPeriod[]): CruxPeriod[] {
  const byMonth = new Map<string, CruxPeriod>();
  for (const p of periods) if (hasData(p)) byMonth.set(p.end.slice(0, 7), p); // oldest first → last write wins
  return [...byMonth.values()].reverse();
}

/**
 * **KPI › Speed** — plan item ج٩ (2 Oct 2026): until now speed was checked by hand. Real Chrome
 * visitors to modonty.com (CrUX), monthly, per device; per page kind where Google has enough
 * visitors to report that URL.
 */
export const getSpeedKpis = unstable_cache(
  async (): Promise<SpeedKpis> => {
    const [phone, desktop, ...pages] = await Promise.all([
      fetchCruxHistory({ origin: SITE_ORIGIN }, "PHONE"),
      fetchCruxHistory({ origin: SITE_ORIGIN }, "DESKTOP"),
      ...PAGE_TYPES.map((p) => fetchCruxHistory({ url: `${SITE_ORIGIN}${p.path}` }, "PHONE", 1)),
    ]);
    // A record can exist with its newest week empty (seen on /clients) — that is «no data», not a row of dashes.
    const latestOf = (h: CruxPeriod[] | null) => {
      const last = h?.at(-1);
      return last && hasData(last) ? last : null;
    };
    const device = (d: CruxDevice, h: CruxPeriod[] | null): DeviceSpeed => ({
      device: d,
      latest: latestOf(h),
      months: h ? monthly(h) : [],
    });
    return {
      devices: [device("PHONE", phone), device("DESKTOP", desktop)],
      pages: PAGE_TYPES.map((p, i) => ({ ...p, latest: latestOf(pages[i]) })),
      fetchedAt: new Date().toISOString(),
    };
  },
  ["kpi-speed-v2"],
  // Google refreshes CrUX history once a week (Monday ~04:00 UTC) — a day-old copy loses nothing.
  { revalidate: 24 * 60 * 60, tags: ["crux-kpi"] },
);
