/**
 * Entity Disambiguator - Phase 11
 *
 * Integrates with Wikidata for semantic entity disambiguation:
 * - Find Wikidata entities by name
 * - Enrich articles with semantic keywords
 * - Link topics to authoritative sources
 */

interface WikidataEntity {
  id: string; // Q-number (e.g., Q42)
  label: string;
  description?: string;
  wikipediaUrl?: string;
  type?: string;
}

interface SemanticKeyword {
  name: string;
  wikidataId?: string;
  wikipediaUrl?: string;
  type?: "Person" | "Organization" | "Place" | "Event" | "Concept" | "Product";
}

/**
 * Search Wikidata for entities matching a query
 */
async function searchWikidata(
  query: string,
  language: string = "ar",
  limit: number = 5
): Promise<WikidataEntity[]> {
  try {
    const url = new URL("https://www.wikidata.org/w/api.php");
    url.searchParams.set("action", "wbsearchentities");
    url.searchParams.set("search", query);
    url.searchParams.set("language", language);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Wikidata API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.search || !Array.isArray(data.search)) {
      return [];
    }

    return data.search.map((item: {
      id: string;
      label: string;
      description?: string;
    }) => ({
      id: item.id,
      label: item.label,
      description: item.description,
    }));
  } catch (error) {
    console.error("Wikidata search failed:", error);
    return [];
  }
}

/**
 * Get entity details from Wikidata
 */
async function getWikidataEntity(
  entityId: string,
  language: string = "ar"
): Promise<WikidataEntity | null> {
  try {
    const url = new URL("https://www.wikidata.org/w/api.php");
    url.searchParams.set("action", "wbgetentities");
    url.searchParams.set("ids", entityId);
    url.searchParams.set("languages", `${language}|en`);
    url.searchParams.set("props", "labels|descriptions|sitelinks");
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Wikidata API error: ${response.status}`);
    }

    const data = await response.json();
    const entity = data.entities?.[entityId];

    if (!entity) {
      return null;
    }

    const label =
      entity.labels?.[language]?.value || entity.labels?.en?.value || entityId;
    const description =
      entity.descriptions?.[language]?.value || entity.descriptions?.en?.value;

    // Get Wikipedia URL
    const wikipediaKey = `${language}wiki`;
    const wikipediaTitle =
      entity.sitelinks?.[wikipediaKey]?.title ||
      entity.sitelinks?.enwiki?.title;

    const wikipediaUrl = wikipediaTitle
      ? `https://${language === "ar" ? "ar" : "en"}.wikipedia.org/wiki/${encodeURIComponent(wikipediaTitle)}`
      : undefined;

    return {
      id: entityId,
      label,
      description,
      wikipediaUrl,
    };
  } catch (error) {
    console.error("Wikidata entity fetch failed:", error);
    return null;
  }
}

/**
 * Find the best matching Wikidata entity for a keyword
 */
async function findWikidataEntity(
  keyword: string,
  language: string = "ar"
): Promise<WikidataEntity | null> {
  const results = await searchWikidata(keyword, language, 3);

  if (results.length === 0) {
    // Try English if Arabic fails
    if (language === "ar") {
      const enResults = await searchWikidata(keyword, "en", 3);
      if (enResults.length > 0) {
        return getWikidataEntity(enResults[0].id, "ar");
      }
    }
    return null;
  }

  // Return the first (most relevant) result with full details
  return getWikidataEntity(results[0].id, language);
}

/**
 * Check if a word is common (should not be entity-linked)
 */
function isCommonWord(word: string): boolean {
  const commonArabic = [
    "في",
    "من",
    "على",
    "إلى",
    "عن",
    "مع",
    "هذا",
    "هذه",
    "التي",
    "الذي",
    "كيف",
    "لماذا",
    "ماذا",
    "متى",
    "أين",
    "كل",
    "بعض",
    "أي",
    "أن",
    "إن",
    "لا",
    "نعم",
    "وهو",
    "وهي",
    "أو",
    "ثم",
    "بل",
    "لكن",
    "أما",
    "إذا",
    "عند",
    "قبل",
    "بعد",
    "بين",
    "حتى",
    "منذ",
    "خلال",
    "حول",
    "نحو",
    "دون",
    "سوى",
    "مثل",
    "غير",
  ];

  const commonEnglish = [
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "and",
    "or",
    "but",
    "if",
    "then",
    "else",
    "when",
    "where",
    "why",
    "how",
    "what",
    "which",
    "who",
    "whom",
    "this",
    "that",
    "these",
    "those",
    "for",
    "with",
    "about",
    "from",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "under",
    "again",
    "further",
    "once",
  ];

  return (
    commonArabic.includes(word) ||
    commonEnglish.includes(word.toLowerCase())
  );
}
