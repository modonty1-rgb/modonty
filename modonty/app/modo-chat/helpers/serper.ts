function getSerperKey() {
  const key = process.env.SERPER_API_KEY;
  if (!key) {
    throw new Error("SERPER_API_KEY is required for web search fallback");
  }
  return key;
}

export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet: string;
  position?: number;
}

export interface SerperResponse {
  organic: SerperOrganicResult[];
}

/**
 * Search the web via Serper API. Returns organic results for RAG.
 */
export async function searchSerper(
  query: string,
  num = 10
): Promise<SerperOrganicResult[]> {
  const key = getSerperKey();
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
    },
    body: JSON.stringify({ q: query, num }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Serper API error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as SerperResponse;
  return data.organic ?? [];
}
