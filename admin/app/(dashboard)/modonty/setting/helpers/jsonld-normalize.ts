/**
 * Normalize Modonty JSON-LD via expand + compact (standalone, no admin/lib/seo).
 */

import * as jsonld from "jsonld";

const DEFAULT_CONTEXT = {
  "@context": "https://schema.org",
};

export async function normalizeModontyJsonLd(jsonLd: object): Promise<object> {
  const expanded = await jsonld.expand(jsonLd);
  const compacted = await jsonld.compact(expanded, DEFAULT_CONTEXT);
  return compacted as object;
}
