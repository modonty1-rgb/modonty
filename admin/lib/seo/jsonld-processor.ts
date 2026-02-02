/**
 * JSON-LD Processor - Phase 5
 *
 * Uses jsonld.js for JSON-LD normalization, expansion, and compaction.
 * Ensures consistent structure before validation and storage.
 */

import * as jsonld from "jsonld";
import type { JsonLdGraph } from "./knowledge-graph-generator";

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
    const expanded = await jsonld.expand(jsonLd as jsonld.JsonLdDocument);

    // Compact back to Schema.org context (ensures consistent structure)
    const context = {
      "@context": "https://schema.org",
    };
    const compacted = await jsonld.compact(expanded, context);

    // Ensure @graph structure is maintained
    if (compacted && typeof compacted === 'object' && "@graph" in compacted) {
      return compacted as unknown as JsonLdGraph;
    }

    // If single node, wrap in @graph
    return {
      "@context": "https://schema.org",
      "@graph": Array.isArray(compacted) ? compacted : [compacted],
    } as JsonLdGraph;
  } catch (error) {
    // If normalization fails, return original (with warning)
    console.warn("JSON-LD normalization failed, using original:", error);
    return jsonLd as JsonLdGraph;
  }
}

/**
 * Expand JSON-LD to fully expanded form
 * Useful for validation and processing
 */
export async function expandJsonLd(
  jsonLd: JsonLdGraph | object
): Promise<object> {
  try {
    return await jsonld.expand(jsonLd as jsonld.JsonLdDocument);
  } catch (error) {
    throw new Error(
      `JSON-LD expansion failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Compact JSON-LD using Schema.org context
 * Makes JSON-LD more readable while maintaining semantics
 */
export async function compactJsonLd(
  jsonLd: JsonLdGraph | object
): Promise<JsonLdGraph> {
  try {
    const context = {
      "@context": "https://schema.org",
    };
    const compacted = await jsonld.compact(jsonLd as jsonld.JsonLdDocument, context);

    // Ensure @graph structure
    if (compacted && typeof compacted === 'object' && "@graph" in compacted) {
      return compacted as unknown as JsonLdGraph;
    }

    return {
      "@context": "https://schema.org",
      "@graph": [compacted],
    } as JsonLdGraph;
  } catch (error) {
    throw new Error(
      `JSON-LD compaction failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validate JSON-LD structure (well-formed check)
 * Returns true if JSON-LD can be expanded successfully
 */
export async function validateJsonLdStructure(
  jsonLd: JsonLdGraph | object
): Promise<{ valid: boolean; error?: string }> {
  try {
    await jsonld.expand(jsonLd as jsonld.JsonLdDocument);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Flatten JSON-LD to flat structure
 * Useful for storage and indexing
 */
export async function flattenJsonLd(
  jsonLd: JsonLdGraph | object
): Promise<object> {
  try {
    return await jsonld.flatten(jsonLd as jsonld.JsonLdDocument);
  } catch (error) {
    throw new Error(
      `JSON-LD flattening failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
