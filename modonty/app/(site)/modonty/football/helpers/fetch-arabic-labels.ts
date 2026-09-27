import { WIKI_USER_AGENT } from "./wiki-user-agent";

/**
 * Arabic names for English Wikipedia pages, from Wikidata — `{ "Al Hilal SFC": "نادي الهلال" }`.
 *
 * The standings and scorers come from the English article because it is the one kept up to
 * date (the Arabic article had not been edited since 14 Sep when both were checked on
 * 27 Sep 2026). Wikidata links the two: every team and player link resolves to an entity
 * with an Arabic label — 37 of 37 on that day. A page with no Arabic label is simply left
 * out of the map, and the caller falls back to the English name.
 */
export async function fetchArabicLabels(titles: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(titles)];
  const labels: Record<string, string> = {};

  // wbgetentities takes at most 50 titles per call.
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    const url =
      "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&sites=enwiki" +
      "&props=labels|sitelinks&languages=ar&sitefilter=enwiki&titles=" +
      encodeURIComponent(batch.join("|"));
    const res = await fetch(url, { headers: { "User-Agent": WIKI_USER_AGENT }, cache: "no-store" });
    if (!res.ok) throw new Error(`wikidata ${res.status}`);
    const json = (await res.json()) as {
      entities?: Record<string, { sitelinks?: { enwiki?: { title: string } }; labels?: { ar?: { value: string } } }>;
    };
    for (const entity of Object.values(json.entities ?? {})) {
      const title = entity.sitelinks?.enwiki?.title;
      const ar = entity.labels?.ar?.value;
      if (title && ar) labels[title] = ar;
    }
  }
  return labels;
}
