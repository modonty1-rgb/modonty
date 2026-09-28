import { fetchArabicLabels } from "../helpers/fetch-arabic-labels";
import { findWikiTable } from "../helpers/find-wiki-table";
import { matchClubName } from "../helpers/match-club-name";
import { readWikiTable } from "../helpers/read-wiki-table";
import { seasonArticleTitle } from "../helpers/season-article-title";
import { shortClubName } from "../helpers/short-club-name";
import type { LeagueTable, Scorer, TableRow } from "../helpers/types";
import { WIKI_USER_AGENT } from "../helpers/wiki-user-agent";
import { readSnapshot, type Snapshot } from "../../data/read-snapshot";

const HOUR = 60 * 60 * 1000;

/** «+18» · «−9» (Wikipedia writes a real minus sign) · «0». */
const toInt = (text: string) => Number.parseInt(text.replace("−", "-").replace("+", ""), 10);

async function loadFromWikipedia(now: Date): Promise<LeagueTable> {
  const title = seasonArticleTitle(now);
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`, {
    headers: { "User-Agent": WIKI_USER_AGENT },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`wikipedia ${title} ${res.status}`);
  const html = await res.text();

  const standingsHtml = findWikiTable(html, ["Pos", "Pld", "Pts"]);
  if (!standingsHtml) throw new Error("standings table not found");
  // Header row dropped; a data row has at least Pos · Team · Pld · W · D · L · GF · GA · GD · Pts.
  const standings = readWikiTable(standingsHtml).slice(1).filter((r) => r.length >= 10 && /^\d+$/.test(r[0].text));
  const scorersHtml = findWikiTable(html, ["Player", "Club", "Goals"]);
  const scorerRows = scorersHtml ? readWikiTable(scorersHtml).slice(1).filter((r) => r.length >= 4 && /^\d+$/.test(r[3].text)) : [];

  const labels = await fetchArabicLabels([
    ...standings.map((r) => r[1].link).filter((t): t is string => !!t),
    ...scorerRows.map((r) => r[1].link).filter((t): t is string => !!t),
  ]);

  // The scorers table names clubs as plain text («Al-Ahli»), the standings as links — so the
  // standings' display names are the bridge to the Arabic.
  const clubNames: Record<string, string> = {};
  for (const r of standings) {
    const ar = r[1].link ? labels[r[1].link] : undefined;
    clubNames[r[1].text] = ar ? shortClubName(ar) : r[1].text;
  }

  const rows: TableRow[] = standings.map((r) => ({
    position: toInt(r[0].text),
    team: clubNames[r[1].text],
    played: toInt(r[2].text),
    won: toInt(r[3].text),
    drawn: toInt(r[4].text),
    lost: toInt(r[5].text),
    goalsFor: toInt(r[6].text),
    goalsAgainst: toInt(r[7].text),
    goalDifference: toInt(r[8].text),
    points: toInt(r[9].text),
    zone: /^AFC /.test(r[10]?.text ?? "") ? "asia" : /^Relegation/.test(r[10]?.text ?? "") ? "drop" : null,
  }));

  const scorers: Scorer[] = scorerRows.map((r) => ({
    rank: toInt(r[0].text),
    player: (r[1].link && labels[r[1].link]) || r[1].text,
    // Fuzzy, not only exact: the same article spells a club two ways — «Al-Kholood» in the
    // standings, «Al-Khoolod» in the scorers (27 Sep 2026).
    club: clubNames[r[2].text] ?? matchClubName(r[2].text, clubNames) ?? r[2].text,
    goals: toInt(r[3].text),
  }));

  if (rows.length < 10) throw new Error(`standings looks wrong: ${rows.length} rows`);
  return { rows, scorers, clubNames };
}

/**
 * Standings and top scorers of the Saudi Pro League — from English Wikipedia, refreshed hourly.
 *
 * Why Wikipedia: API-Football's free plan refuses the current season for these endpoints
 * («Free plans do not have access to this season, try from 2022 to 2024.» — measured
 * 27 Sep 2026), and Khalid chose free sources until the page proves itself. The table was
 * checked against ESPN the same day: Al-Hilal 7 played / 18 pts, Al-Ittihad 17, Al-Nassr 16 —
 * identical. Wikipedia text is CC BY-SA, so the page credits it under the table.
 */
export async function getLeagueTable(now: Date): Promise<Snapshot<LeagueTable>> {
  // v2: rows gained goalsFor/goalsAgainst (27 Sep 2026) — a new key so no old-shaped copy is read.
  return readSnapshot("football:spl:wikipedia:v2", () => HOUR, () => loadFromWikipedia(now));
}
