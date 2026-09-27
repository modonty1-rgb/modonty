import { readSnapshot, type Snapshot } from "./read-snapshot";

const DAY = 24 * 60 * 60 * 1000;

/** API-Football's name for a club → its crest URL. Clubs with a stadium on record come first. */
export type CrestsByApiName = Record<string, string>;

const crestUrl = (id: number) => `https://media.api-sports.io/football/teams/${id}.png`;

/**
 * Clubs API-Football files under another country, so `teams?country=Saudi-Arabia` misses them.
 * Al-Khaleej (Saihat): listed as «United-Arab-Emirates» though its stadium is Prince Mohamed bin
 * Fahd in Dammam (teams?search=Khaleej, 27 Sep 2026).
 */
const MISFILED: Record<string, number> = { "Al Khaleej Saihat": 2928 };

interface ApiTeam {
  team: { id: number; name: string; national: boolean };
  venue: { name: string | null } | null;
}

async function loadCrests(): Promise<CrestsByApiName> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new Error("API_FOOTBALL_KEY is not set");
  const res = await fetch("https://v3.football.api-sports.io/teams?country=Saudi-Arabia", {
    headers: { "x-apisports-key": key },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`api-football ${res.status}`);
  const json = (await res.json()) as { errors?: unknown; response?: ApiTeam[] };
  const errors = json.errors && typeof json.errors === "object" ? Object.values(json.errors) : [];
  if (errors.length) throw new Error(`api-football: ${JSON.stringify(json.errors).slice(0, 200)}`);

  // Women's sides («Al Hilal W») and exhibition sides would otherwise compete for the same name.
  // Two rows can still share a name — «Al-Riyadh» (2981, no data) and «Al Riyadh» (10511, founded
  // 1954, own stadium) — so the one with a stadium is listed first and wins the tie.
  const teams = (json.response ?? [])
    .filter((t) => !t.team.national && !/\sW$|Stars|U\d\d/.test(t.team.name))
    .sort((a, b) => Number(!!b.venue?.name) - Number(!!a.venue?.name));

  const crests: CrestsByApiName = {};
  for (const t of teams) crests[t.team.name] ??= crestUrl(t.team.id);
  for (const [name, id] of Object.entries(MISFILED)) crests[name] ??= crestUrl(id);
  return crests;
}

/**
 * Crest URLs for Saudi clubs — one API call a month (crests do not change mid-season). The
 * images themselves are free: «Calls to logos/images do not count towards your daily quota»
 * (API-Football v3 docs).
 */
export async function getClubCrests(): Promise<Snapshot<CrestsByApiName>> {
  return readSnapshot("football:crests:saudi", () => 30 * DAY, loadCrests);
}
