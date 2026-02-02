export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
    url?: string;
  };
  author: string | null;
  content: string | null;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface NewsAPITitlesData {
  titles: string[];
  articles: NewsArticle[];
}

export interface NewsAPITagsData {
  tags: string[];
}

/**
 * Fetch Arabic article titles from NewsAPI.org
 * Following OpenAI pattern for consistency
 */
export async function fetchArticleTitlesFromNewsAPI(params: {
  language: "ar";
  pageSize: number;
  query?: string;
  industryBrief?: string;
}): Promise<NewsAPITitlesData> {
  const { language, pageSize, query, industryBrief } = params;

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error("NEWS_API_KEY is not configured.");
  }

  // Build query string - use industryBrief or query or default to a broader Arabic-friendly query
  // Note: NewsAPI free tier may have limited Arabic content, so we use a broader query
  const searchQuery = query || industryBrief || "technology";
  const encodedQuery = encodeURIComponent(searchQuery);

  // Try multiple fallback queries if the first one fails
  const fallbackQueries = [searchQuery, "technology", "business", ""];
  
  let lastError: Error | null = null;

  for (const tryQuery of fallbackQueries) {
    try {
      // NewsAPI.org /v2/everything endpoint
      // Note: According to official docs, 'q' parameter is required for /v2/everything
      // If empty query, we'll try with a minimal query
      const actualQuery = tryQuery || "a"; // Use single character as minimal query
      const encodedActualQuery = encodeURIComponent(actualQuery);
      
      const url = `https://newsapi.org/v2/everything?` +
        `language=${language}&` +
        `pageSize=${pageSize}&` +
        `q=${encodedActualQuery}&` +
        `sortBy=popularity&` +
        `apiKey=${apiKey}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "MODONTY-Seed-Bot/1.0",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(
          `NewsAPI request failed: ${response.status} ${response.statusText}. ${errorText}`
        );
        continue; // Try next fallback
      }

      const data: NewsAPIResponse = await response.json();

      if (data.status !== "ok") {
        // Check for specific error codes from NewsAPI
        if (data.status === "error") {
          const errorMessage = (data as any).message || "Unknown NewsAPI error";
          lastError = new Error(`NewsAPI error: ${errorMessage}`);
          continue; // Try next fallback
        }
        lastError = new Error(`NewsAPI returned error status: ${data.status}`);
        continue; // Try next fallback
      }

      // Check totalResults - might be 0 even if status is "ok"
      if (data.totalResults === 0) {
        lastError = new Error(
          `NewsAPI returned no articles for query "${actualQuery}" with language "${language}". ` +
          `Free tier may have limited Arabic content. Consider upgrading your NewsAPI plan or using OpenAI/templates instead.`
        );
        continue; // Try next fallback
      }

      if (!data.articles || data.articles.length === 0) {
        lastError = new Error(
          `NewsAPI returned ${data.totalResults} total results but no articles in response. ` +
          `This may indicate a pagination issue or API limitation.`
        );
        continue; // Try next fallback
      }

      // Extract titles from articles
      const titles = data.articles
        .map((article) => article.title)
        .filter((title) => title && title.trim().length > 0);

      if (titles.length === 0) {
        lastError = new Error("No valid titles found in NewsAPI response");
        continue; // Try next fallback
      }

      // Success! Return the results
      return {
        titles,
        articles: data.articles,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue; // Try next fallback
    }
  }

  // All fallbacks failed
  throw lastError || new Error("All NewsAPI query attempts failed");
}

/**
 * Extract tags/keywords from NewsAPI articles
 * Extracts keywords from article titles and descriptions
 */
export function extractTagsFromNewsAPI(params: {
  articles: NewsArticle[];
}): NewsAPITagsData {
  const { articles } = params;

  if (!articles || articles.length === 0) {
    return { tags: [] };
  }

  const tagSet = new Set<string>();

  for (const article of articles) {
    // Extract from title
    if (article.title) {
      const titleWords = extractKeywords(article.title);
      titleWords.forEach((word) => tagSet.add(word));
    }

    // Extract from description
    if (article.description) {
      const descWords = extractKeywords(article.description);
      descWords.forEach((word) => tagSet.add(word));
    }
  }

  // Convert to array, filter out very short tags and normalize
  const tags = Array.from(tagSet)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length >= 2) // Minimum 2 characters
    .filter((tag) => tag.length <= 50) // Maximum 50 characters
    .map((tag) => normalizeTag(tag))
    .filter((tag) => tag.length > 0);

  // Remove duplicates (case-insensitive)
  const uniqueTags: string[] = [];
  const seen = new Set<string>();

  for (const tag of tags) {
    const lower = tag.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueTags.push(tag);
    }
  }

  return { tags: uniqueTags };
}

/**
 * Extract keywords from text (Arabic and English)
 * Simple keyword extraction - looks for words, removes common stop words
 */
function extractKeywords(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Arabic stop words (common words to filter out)
  const arabicStopWords = new Set([
    "في",
    "من",
    "إلى",
    "على",
    "أن",
    "هو",
    "هي",
    "كان",
    "كانت",
    "يكون",
    "بعد",
    "قبل",
    "مع",
    "عند",
    "هذا",
    "هذه",
    "التي",
    "الذي",
    "إن",
    "إذا",
    "لكن",
    "أو",
    "و",
    "عن",
    "ل",
    "ب",
    "ك",
  ]);

  // Split by spaces and punctuation
  const words = text
    .split(/[\s\u200C\u200B\-–—,،.。!！?؟:：;؛\n\r\t]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

  // Filter stop words and extract meaningful keywords
  const keywords: string[] = [];

  for (const word of words) {
    const normalized = word.trim();

    // Skip very short words
    if (normalized.length < 2) {
      continue;
    }

    // Skip Arabic stop words
    if (arabicStopWords.has(normalized)) {
      continue;
    }

    // Skip common English stop words
    const lower = normalized.toLowerCase();
    if (
      [
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "from",
        "as",
        "is",
        "was",
        "are",
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
      ].includes(lower)
    ) {
      continue;
    }

    keywords.push(normalized);
  }

  return keywords;
}

/**
 * Normalize tag - remove special characters, trim whitespace
 */
function normalizeTag(tag: string): string {
  return tag
    .trim()
    .replace(/[^\u0600-\u06FF\w\s-]/g, "") // Keep Arabic, alphanumeric, spaces, hyphens
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}
