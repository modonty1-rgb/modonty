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

    // `parse()` returns an OBJECT keyed by format, and each format is itself keyed by
    // schema.org type:
    //
    //   { metatags, microdata, rdfa, jsonld, headings, errors }
    //   jsonld  ->  { Article: [ { "@context", "@type", "@location", … } ] }
    //
    // This code ran `Array.isArray(extracted)`, which is false for an object, so the whole
    // loop below never executed once — the extractor always fell through to the manual
    // script-tag fallback and reported zero microdata and zero RDFa on every page.
    //
    // Verified against the installed package (@marbec/web-auto-extractor 2.2.1), not from
    // memory: its README states the output format, and running it on a page carrying JSON-LD,
    // microdata and a meta tag printed `Array.isArray(parse()) = false` with keys
    // `[metatags, microdata, rdfa, jsonld, headings, errors]`. `errors` is undocumented in the
    // README and appeared only in the real run — which is why this reads the object rather
    // than trusting a written list.
    //
    // `admin/lib/seo/marbec-extractor.d.ts` declared `parse(): unknown[]`; the package ships
    // no types of its own, so that hand-written declaration is where the wrong shape came
    // from. It is corrected alongside this.
    // Through `unknown`: the declared result type has named keys, not an index signature, so a
    // direct cast is the one tsc flags. Reading it by key is deliberate — see the note above
    // about `errors` appearing in the real output but not in the README.
    const byFormat = (extracted ?? {}) as unknown as Record<string, unknown>;

    const collect = (formatKey: string, into: unknown[]) => {
      const group = byFormat[formatKey];
      if (!group || typeof group !== "object") return;
      // Each format is `{ TypeName: item[] }` — flatten to a plain list of entities.
      for (const entities of Object.values(group as Record<string, unknown>)) {
        if (!Array.isArray(entities)) continue;
        for (const item of entities) {
          into.push(item);
          all.push(item);
          if (item && typeof item === "object") {
            const itemObj = item as Record<string, unknown>;
            if (itemObj["@location"]) {
              const itemId = itemObj["@id"] || itemObj["@type"] || String(all.length - 1);
              locations[String(itemId)] = itemObj["@location"];
            }
          }
        }
      }
    };

    // The format is known from the key it arrived under — no guessing from `@source` or
    // `itemscope`, which is what the old branch had to do because it had lost that context.
    collect("jsonld", jsonLd);
    collect("microdata", microdata);
    collect("rdfa", rdfa);

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
