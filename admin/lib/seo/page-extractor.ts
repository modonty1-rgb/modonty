/**
 * Page Extractor - Structured Data Extraction
 *
 * Uses @marbec/web-auto-extractor to extract all structured data formats
 * (JSON-LD, Microdata, RDFa) from rendered HTML.
 */

import WebAutoExtractor from "@marbec/web-auto-extractor";

export interface ExtractedData {
  jsonLd: unknown[];
  microdata: unknown[];
  rdfa: unknown[];
  all: unknown[];
  locations: Record<string, unknown>;
  raw: {
    jsonLd: unknown[];
    microdata: unknown[];
    rdfa: unknown[];
  };
}

/**
 * Extract all structured data from HTML
 */
export async function extractStructuredData(html: string): Promise<ExtractedData> {
  try {
    // Create extractor with location tracking and all source formats
    const extractor = new WebAutoExtractor({
      addLocation: true,
      embedSource: ["rdfa", "microdata"],
    });

    // Parse HTML to extract structured data
    const extracted = extractor.parse(html);

    // Separate by format type
    const jsonLd: unknown[] = [];
    const microdata: unknown[] = [];
    const rdfa: unknown[] = [];
    const all: unknown[] = [];
    const locations: Record<string, unknown> = {};

    // Process extracted data
    if (extracted && Array.isArray(extracted)) {
      for (const item of extracted) {
        // Add to all collection
        all.push(item);

        // Categorize by source
        if (item && typeof item === "object") {
          const itemObj = item as Record<string, unknown>;

          // Check for JSON-LD
          if (itemObj["@context"] || itemObj["@type"]) {
            jsonLd.push(item);
          }

          // Check for Microdata (has itemscope or embedded source info)
          if (itemObj["@source"] === "microdata" || itemObj.itemscope) {
            microdata.push(item);
          }

          // Check for RDFa (has typeof or about attributes)
          if (itemObj["@source"] === "rdfa" || itemObj["@about"] || itemObj["@typeof"]) {
            rdfa.push(item);
          }

          // Extract location info if available
          if (itemObj["@location"]) {
            const itemId = itemObj["@id"] || itemObj["@type"] || String(all.length - 1);
            locations[String(itemId)] = itemObj["@location"];
          }
        }
      }
    }

    // If no data found, try alternative extraction
    if (all.length === 0) {
      // Try parsing JSON-LD scripts directly
      const jsonLdScripts = extractJSONLDScripts(html);
      jsonLd.push(...jsonLdScripts);
      all.push(...jsonLdScripts);
    }

    return {
      jsonLd,
      microdata,
      rdfa,
      all,
      locations,
      raw: {
        jsonLd,
        microdata,
        rdfa,
      },
    };
  } catch (error) {
    // Fallback: Extract JSON-LD from script tags manually
    const jsonLdScripts = extractJSONLDScripts(html);
    
    return {
      jsonLd: jsonLdScripts,
      microdata: [],
      rdfa: [],
      all: jsonLdScripts,
      locations: {},
      raw: {
        jsonLd: jsonLdScripts,
        microdata: [],
        rdfa: [],
      },
    };
  }
}

/**
 * Fallback: Extract JSON-LD from script tags manually
 */
function extractJSONLDScripts(html: string): unknown[] {
  const jsonLdData: unknown[] = [];
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const jsonContent = match[1].trim();
      if (jsonContent) {
        const parsed = JSON.parse(jsonContent);
        
        // Handle @graph arrays
        if (parsed && typeof parsed === "object" && "@graph" in parsed && Array.isArray(parsed["@graph"])) {
          jsonLdData.push(...parsed["@graph"]);
        } else {
          jsonLdData.push(parsed);
        }
      }
    } catch (parseError) {
      // Skip invalid JSON
      continue;
    }
  }

  return jsonLdData;
}

/**
 * Extract all structured data formats from HTML and combine into validator format
 */
export function combineExtractedData(extracted: ExtractedData): unknown {
  // Create a @graph structure if we have multiple items
  if (extracted.all.length === 0) {
    return {};
  }

  if (extracted.all.length === 1) {
    return extracted.all[0];
  }

  // Return as @graph for multiple items
  return {
    "@context": "https://schema.org",
    "@graph": extracted.all,
  };
}
