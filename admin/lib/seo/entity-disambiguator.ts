/**
 * Entity Disambiguator - Phase 11
 *
 * Integrates with Wikidata for semantic entity disambiguation:
 * - Find Wikidata entities by name
 * - Enrich articles with semantic keywords
 * - Link topics to authoritative sources
 */

export interface WikidataEntity {
  id: string; // Q-number (e.g., Q42)
  label: string;
  description?: string;
  wikipediaUrl?: string;
  type?: string;
}

export interface SemanticKeyword {
  name: string;
  wikidataId?: string;
  wikipediaUrl?: string;
  type?: "Person" | "Organization" | "Place" | "Event" | "Concept" | "Product";
}

/**
 * Search Wikidata for entities matching a query
 */
export async function searchWikidata(
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
export async function getWikidataEntity(
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
export async function findWikidataEntity(
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
 * Enrich article keywords with Wikidata entities
 */
export async function enrichKeywordsWithWikidata(
  keywords: string[],
  language: string = "ar"
): Promise<SemanticKeyword[]> {
  const enriched: SemanticKeyword[] = [];

  for (const keyword of keywords) {
    const entity = await findWikidataEntity(keyword, language);

    if (entity) {
      enriched.push({
        name: keyword,
        wikidataId: entity.id,
        wikipediaUrl: entity.wikipediaUrl,
      });
    } else {
      enriched.push({
        name: keyword,
      });
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return enriched;
}

/**
 * Extract potential keywords from article for entity linking
 */
export function extractKeywordsForEntityLinking(
  title: string,
  categoryName?: string,
  tagNames?: string[]
): string[] {
  const keywords: string[] = [];

  // Add category
  if (categoryName) {
    keywords.push(categoryName);
  }

  // Add tags
  if (tagNames) {
    keywords.push(...tagNames);
  }

  // Extract potential entities from title (simple heuristic)
  const titleWords = title.split(/\s+/).filter((w) => w.length > 3);
  for (const word of titleWords) {
    // Skip common words
    if (isCommonWord(word)) continue;
    if (!keywords.includes(word)) {
      keywords.push(word);
    }
    // Limit to avoid too many API calls
    if (keywords.length >= 10) break;
  }

  return keywords.slice(0, 10);
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

/**
 * Generate semantic keywords JSON for article storage
 */
export function formatSemanticKeywordsForStorage(
  keywords: SemanticKeyword[]
): object[] {
  return keywords.map((k) => ({
    name: k.name,
    ...(k.wikidataId && { wikidataId: k.wikidataId }),
    ...(k.wikipediaUrl && { url: k.wikipediaUrl }),
    ...(k.type && { type: k.type }),
  }));
}
