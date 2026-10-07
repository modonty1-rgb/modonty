/**
 * JSON-LD Processor - Phase 5
 *
 * Uses jsonld.js for JSON-LD normalization, expansion, and compaction.
 * Ensures consistent structure before validation and storage.
 */

import * as jsonld from "jsonld";

import { schemaOrgDocumentLoader } from "./schema-org-document-loader";
import type { JsonLdGraph } from "./knowledge-graph-generator";

/**
 * Passed to EVERY jsonld.js call below. Without it the library dereferences
 * `"@context": "https://schema.org"` over the network on each call, which put schema.org on
 * the article publish path (see schema-org-document-loader.ts for the measurement).
 */
const LOADER = { documentLoader: schemaOrgDocumentLoader };

/**
 * Recursively fix JSON-LD @ keywords after jsonld.compact() with Schema.org context.
 * jsonld.compact() converts "@type" → "type" and "@id" → "id" at ALL nesting levels.
 * This restores them to spec-compliant @ prefixes throughout the entire tree.
 */
function fixAtKeywordsDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(fixAtKeywordsDeep);
  }
  if (value !== null && typeof value === "object") {
    const fixed: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const key = k === "id" ? "@id" : k === "type" ? "@type" : k;
      fixed[key] = fixAtKeywordsDeep(v);
    }
    return fixed;
  }
  return value;
}

/**
 * Normalize JSON-LD to canonical form
 * Ensures consistent structure for storage and comparison
 * Uses expand + compact to normalize structure
 */
export async function normalizeJsonLd(
  jsonLd: JsonLdGraph | object
): Promise<JsonLdGraph> {
  try {
    // Expand to fully expanded form (resolves all @context references)
    const expanded = await jsonld.expand(jsonLd as jsonld.JsonLdDocument, LOADER);

    // Compact back to Schema.org context (ensures consistent structure)
    const context = {
      "@context": "https://schema.org",
    };
    const compacted = await jsonld.compact(expanded, context, LOADER);

    // Ensure @graph structure is maintained
    let result: JsonLdGraph;
    if (compacted && typeof compacted === 'object' && "@graph" in compacted) {
      result = compacted as unknown as JsonLdGraph;
    } else {
      // If single node, wrap in @graph
      result = {
        "@context": "https://schema.org",
        "@graph": Array.isArray(compacted) ? compacted : [compacted],
      } as JsonLdGraph;
    }

    // Fix: jsonld.compact() with Schema.org context converts @id → id and @type → type.
    // Restore JSON-LD spec-compliant @ prefixes recursively (nested objects too).
    result = fixAtKeywordsDeep(result) as JsonLdGraph;

    return result;
  } catch (error) {
    // If normalization fails, return original (with warning)
    console.warn("JSON-LD normalization failed, using original:", error);
    return jsonLd as JsonLdGraph;
  }
}
